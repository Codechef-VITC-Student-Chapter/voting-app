import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { logout } from './actions'

export default async function PrivatePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/login')
  }

  const isAdmin = data.user.email === "akkilalagar05@gmail.com"

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">CodeChef VIT Voting Portal</h1>
            <form>
              <Button variant="outline" formAction={logout}>
                Log Out
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-base">
              Hello <span className="font-medium">{data.user.email}</span>
            </p>
            {isAdmin && (
              <p className="text-sm text-muted-foreground">Admin privileges active</p>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <Button asChild>
              <Link href="/voting">Voting</Link>
            </Button>
            <Button asChild>
              <Link href="/results">Results</Link>
            </Button>
            {isAdmin && (
              <Button asChild>
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
