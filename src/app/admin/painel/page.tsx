'use client'

import { useRouter,useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AppSidebar } from "@/app/admin/components/sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import Loading from '../components/loading'
import Dashboard from '../pages/dashboard'

export default function PainelPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isValid, setIsValid] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const checkToken = async () => {
      const token = searchParams.get('token')
        if (!token) return router.push("/admin");
      try {
        const res = await fetch("/api/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        
        const data = await res.json();
        if (!data.valid) {
          toast.info(data.error)
          router.push("/admin");
        }
        else {
          setIsValid(true)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    };
    checkToken();
  }, [searchParams, router])

  if (loading) {
    return (
      <Loading />
    )
  }
  return (
    <div>
      {isValid && (
        <div>
          <SidebarProvider>
            <AppSidebar/>
            <SidebarTrigger />
              <Dashboard />
          </SidebarProvider>
          {/* Coloca os formulários de update aqui */}
        </div>
      )}
      
      {!isValid && (
        <Loading />
      )}
    </div>
  )
}
