import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { login, signup } from '../actions'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'

export default async function LoginPage() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (data?.user) {
        redirect('/')
    }
  return (
    <div className='flex w-screen h-screen justify-center items-center'>
        <Card className='p-4 w-[30%]'>
            <CardTitle>
                Login
            </CardTitle>
            <CardDescription>
                <form className='flex flex-col gap-4'>
                    <Label htmlFor="email">Email:</Label>
                    <Input id="email" name="email" type="email" required />
                    <Label htmlFor="password">Password:</Label>
                    <Input id="password" name="password" type="password" required />
                    <div className='gap-5 flex justify-end'>
                        <Button formAction={login}>Login</Button>
                        <Button formAction={signup}>Sign up</Button>
                    </div>
                </form>
            </CardDescription>
        </Card>
    </div>
  )
}