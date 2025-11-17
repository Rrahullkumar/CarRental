import React, { useState } from 'react'
import { assets, menuLinks } from '../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import {motion} from 'motion/react'

const Navbar = () => {

  const {setShowLogin, user, logout, isOwner, axios, setIsOwner} = useAppContext()

  const location = useLocation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const changeRole = async () =>{
    try {
      const {data} = await axios.post('/api/owner/change-role')
      if (data.success) {
        setIsOwner(true)
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <motion.div
      initial={{y:-20, opacity:0}}
      animate={{y:0, opacity:1}}
      transition={{duration:0.5}}
      className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all ${
        location.pathname === '/' ? 'bg-llight' : ''
      }`}
    >
      <Link to={'/'}>
        <motion.img whileHover={{scale:1.05}} src={assets.logo} alt="logo" className="h-8" />
      </Link>

      {/* menu links */}
      <div
        className={`fixed top-16 right-0 h-screen w-full border-t border-borderColor flex flex-col items-start gap-4 p-4 transition-all duration-300 z-50
        sm:static sm:h-auto sm:w-auto sm:border-0 sm:flex-row sm:items-center sm:gap-8 sm:p-0
        ${location.pathname === '/' ? 'bg-llight sm:bg-transparent' : 'bg-white sm:bg-transparent'}
        ${open ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}`}
      >
        {menuLinks.map((link, index) => (
          <Link key={index} to={link.path}>
            {link.name}
          </Link>
        ))}

        {/* search (only lg+) */}
        <div className="hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56">
          <input
            type="text"
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
            placeholder="Search Cars"
          />
          <img src={assets.search_icon} alt="search" />
        </div>

        {/* Dashboard and login */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <button
            onClick={() => isOwner? navigate('/owner'): changeRole()}
            className="cursor-pointer"
          >
           {isOwner? 'Dashboard' :'List cars'}
          </button>
          <button
            onClick={() => {user ? logout() :  setShowLogin(true)}}
            className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg"
          >
            {user? 'Logout' :'Login'}
          </button>
        </div>
      </div>

      {/* mobile toggle btn */}
      <button
        className="sm:hidden cursor-pointer"
        aria-label="Menu"
        onClick={() => setOpen(!open)}
      >
        <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
      </button>
    </motion.div>
  )
}

export default Navbar
