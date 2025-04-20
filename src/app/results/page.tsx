import Image from 'next/image'
import React from 'react'

const ResultsPage = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[80vh] text-5xl font-bold gap-4'>
      <div>
        Did you really think we would show you the results????? 😂
      </div>
      <Image 
        src="/hi.gif"
        alt="404"
        width={400}
        height={400}
      />
    </div>
  )
}

export default ResultsPage
