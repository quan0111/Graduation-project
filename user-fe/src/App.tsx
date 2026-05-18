import './App.css'
import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./routes/index"
import { apiClient } from "./lib/api"

function App() {
  useEffect(() => {
    let lastSentAt = 0
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const interactive = target?.closest("button,a,[role='button']") as HTMLElement | null
      if (!interactive) return

      const now = Date.now()
      if (now - lastSentAt < 500) return
      lastSentAt = now

      void apiClient.post("/audit/track", {
        action: "CLIENT.CLICK",
        entityType: "ClientEvent",
        metadata: {
          path: window.location.pathname,
          tag: interactive.tagName.toLowerCase(),
          text: interactive.textContent?.trim().slice(0, 120) || null,
          href: interactive instanceof HTMLAnchorElement ? interactive.href : null,
        },
      }).catch(() => undefined)
    }

    window.addEventListener("click", handleClick, { capture: true })
    return () => window.removeEventListener("click", handleClick, { capture: true })
  }, [])

  return <RouterProvider router={router} />
}

export default App
