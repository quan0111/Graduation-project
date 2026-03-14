
import ReactDOM from "react-dom/client"
import App from "./App"
import { Toaster } from 'sonner'
import "./index.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster richColors position="top-right" />
  </QueryClientProvider>
)