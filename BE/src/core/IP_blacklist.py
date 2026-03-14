from fastapi import HTTPException,Request

blacklist = set()


def add_ip_to_blackList(ip:str):
    blacklist.add(ip)

def check_ip_blacklist(request: Request):

    ip = request.client.host

    if ip in blacklist:
        raise HTTPException(
            status_code=403,
            detail="Your IP has been blocked"
        )