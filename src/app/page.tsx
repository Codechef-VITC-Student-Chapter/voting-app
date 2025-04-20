import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import { Button } from '@/components/ui/button'
import { logout } from './actions'

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return(
    <div>
      <p>
        Hello {data.user.email}
      </p>
      <form>
        <Button formAction={logout}>Log Out</Button>
      </form>
    </div>
  )
}