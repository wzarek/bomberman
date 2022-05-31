import React from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
    return (
        <nav>
            <NavLink to='/' className={isActive => 'nav-active'}>
                <h2>Bomberman</h2>
            </NavLink>
            <NavLink to='/' className={isActive => 'nav-active'}>
                game finder
            </NavLink>
            <NavLink to='/' className={isActive => 'nav-active'}>
                profile
            </NavLink>
        </nav>
    )
}

export default Navbar
