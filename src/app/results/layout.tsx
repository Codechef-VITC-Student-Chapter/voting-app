import Navbar from '@/components/navbar'
import React, { ReactNode } from 'react'

const layout = ({children}:{children:ReactNode}) => {
  return (
    <div>
      <Navbar />
      <div className='flex justify-center items-center'>
        {children}
      </div>
    </div>
  )
}

export default layout