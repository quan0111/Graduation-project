from collections import Counter, defaultdict
from dataclasses import dataclass
import math
import re
import unicodedata
from typing import Dict, List, Sequence


@dataclass(frozen=True)
class SemanticMatch:
    product_id: int
    score: float
    matched_terms: List[str]


class ProductSemanticRetriever:
    """Lightweight sparse semantic retrieval for product text.

    This keeps the project dependency-free while giving recommendations a real
    retrieval stage. It is not a dense embedding/vector DB, but it behaves like
    a semantic candidate generator by normalizing Vietnamese text, expanding
    common shopping intents, and ranking products with TF-IDF style signals.
    """

    STOP_WORDS = {
        "anh",
        "ban",
        "can",
        "cho",
        "co",
        "cua",
        "de",
        "duoi",
        "duoc",
        "gia",
        "gi",
        "goi",
        "hang",
        "hay",
        "hop",
        "khong",
        "khoang",
        "la",
        "minh",
        "mot",
        "mua",
        "nao",
        "nen",
        "pham",
        "phu",
        "san",
        "the",
        "thi",
        "tim",
        "toi",
        "tr",
        "tren",
        "trieu",
        "tu",
        "van",
        "ve",
        "voi",
        "xuat",
        "vnd",
    }

    PHRASE_EXPANSIONS = {
        "di tiec": ["vay", "dam", "ao", "giay", "thoi trang", "sang", "dep"],
        "cong so": ["ao", "so mi", "quan", "vay", "lich su", "thoi trang"],
        "di lam": ["cong so", "ao", "so mi", "quan", "giay", "tui"],
        "di hoc": ["balo", "sach", "vo", "but", "laptop", "tai nghe"],
        "the thao": ["giay", "ao", "quan", "fitness", "gym"],
        "choi game": ["gaming", "laptop", "chuot", "ban phim", "tai nghe"],
        "hoc lap trinh": ["laptop", "may tinh", "ban phim", "chuot"],
        "qua tang": ["dep", "tien loi", "hop", "phu kien"],
        "gia re": ["khuyen mai", "sale", "uu dai", "tiet kiem"],
        "cao cap": ["premium", "chinh hang", "ben", "sang"],
    }

    TOKEN_EXPANSIONS = {
        "phone": ["dien", "thoai", "smartphone"],
        "smartphone": ["dien", "thoai", "phone"],
        "laptop": ["may", "tinh", "notebook"],
        "pc": ["may", "tinh"],
        "headphone": ["tai", "nghe"],
        "earphone": ["tai", "nghe"],
        "fashion": ["thoi", "trang"],
        "dress": ["vay", "dam"],
        "shoes": ["giay"],
        "bag": ["tui", "balo"],
        "sale": ["khuyen", "mai", "uu", "dai"],
    }

    FIELD_WEIGHTS = {
        "name": 4,
        "category": 3,
        "tags": 3,
        "attributes": 2,
        "shop": 1,
        "description": 1,
    }

    @classmethod
    def rank(
        cls,
        query: str,
        products: Sequence,
        top_k: int = 40,
        min_score: float = 0.08,
    ) -> List[SemanticMatch]:
        query_terms = cls.query_terms(query)
        if not query_terms or not products:
            return []

        documents = []
        document_frequency: Dict[str, int] = defaultdict(int)
        for product in products:
            weighted_terms = cls.product_terms(product)
            if not weighted_terms:
                continue
            documents.append((product.id, weighted_terms, cls.product_text(product)))
            for term in weighted_terms:
                document_frequency[term] += 1

        if not documents:
            return []

        total_docs = len(documents)
        query_counter = Counter(query_terms)
        matches: List[SemanticMatch] = []

        for product_id, weighted_terms, full_text in documents:
            score = 0.0
            matched_terms = []
            document_length = sum(weighted_terms.values()) or 1

            for term, query_weight in query_counter.items():
                frequency = weighted_terms.get(term, 0)
                if frequency <= 0:
                    continue

                idf = math.log(1 + (total_docs + 1) / (document_frequency.get(term, 0) + 0.5))
                tf = frequency / document_length
                score += (tf * idf * (1 + math.log1p(query_weight))) * 100
                matched_terms.append(term)

            normalized_query = normalize_text(query)
            if normalized_query and len(normalized_query) >= 5 and normalized_query in full_text:
                score += 2.5

            if score >= min_score:
                matches.append(SemanticMatch(product_id=product_id, score=score, matched_terms=matched_terms[:6]))

        matches.sort(key=lambda item: item.score, reverse=True)
        return matches[:top_k]

    @classmethod
    def score_map(cls, query: str, products: Sequence, top_k: int = 80) -> Dict[int, float]:
        matches = cls.rank(query=query, products=products, top_k=top_k)
        if not matches:
            return {}

        max_score = max(match.score for match in matches) or 1.0
        return {match.product_id: match.score / max_score for match in matches}

    @classmethod
    def query_terms(cls, query: str) -> List[str]:
        normalized = normalize_text(query)
        expanded_text = [normalized]
        for phrase, extra_terms in cls.PHRASE_EXPANSIONS.items():
            if phrase in normalized:
                expanded_text.extend(extra_terms)

        terms = cls._tokenize(" ".join(expanded_text))
        expanded_terms = []
        for term in terms:
            expanded_terms.append(term)
            expanded_terms.extend(cls.TOKEN_EXPANSIONS.get(term, []))
        return [term for term in expanded_terms if term not in cls.STOP_WORDS]

    @classmethod
    def product_terms(cls, product) -> Counter:
        weighted_parts = {
            "name": getattr(product, "name", "") or "",
            "description": getattr(product, "description", "") or "",
            "category": getattr(getattr(product, "category", None), "name", "") or "",
            "shop": getattr(getattr(product, "shop", None), "name", "") or "",
            "tags": " ".join(getattr(tag, "name", "") for tag in getattr(product, "tags", []) or []),
            "attributes": " ".join(
                f"{getattr(attribute, 'key', '')} {getattr(attribute, 'value', '')}"
                for attribute in getattr(product, "attributes", []) or []
            ),
        }
        terms = Counter()
        for field, value in weighted_parts.items():
            weight = cls.FIELD_WEIGHTS.get(field, 1)
            for token in cls._tokenize(value):
                if token in cls.STOP_WORDS:
                    continue
                terms[token] += weight
        return terms

    @classmethod
    def product_text(cls, product) -> str:
        parts = [
            getattr(product, "name", "") or "",
            getattr(product, "description", "") or "",
            getattr(getattr(product, "category", None), "name", "") or "",
            getattr(getattr(product, "shop", None), "name", "") or "",
            " ".join(getattr(tag, "name", "") for tag in getattr(product, "tags", []) or []),
        ]
        return normalize_text(" ".join(parts))

    @classmethod
    def _tokenize(cls, value: str) -> List[str]:
        return [token for token in re.findall(r"[a-z0-9]+", normalize_text(value)) if len(token) > 1]


def normalize_text(value: str) -> str:
    value = (value or "").lower().replace("\u0111", "d")
    decomposed = unicodedata.normalize("NFD", value)
    return "".join(char for char in decomposed if unicodedata.category(char) != "Mn")
