import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"

interface BackButtonProps {
  fallbackTo?: string
  label?: string
}

function BackButton({ fallbackTo = "/", label = "Back" }: BackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate(fallbackTo)
  }

  return (
    <Button onClick={handleBack} type="button" variant="outline">
      <ArrowLeft size={16} />
      {label}
    </Button>
  )
}

export default BackButton
