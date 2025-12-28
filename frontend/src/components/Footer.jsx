import React from 'react'

const Footer = () => {
  return (
    <div className='w-full h-10 bg-black border-separate border-gray-800 border-t-2 text-white flex items-center justify-center fixed bottom-0 left-0 z-50'>
      <h1 className="text-sm">&copy; {new Date().getFullYear()} Cashbook &mdash; All rights reserved. Developed by M Rahul Bhat</h1>
    </div>
  )
}

export default Footer;  