import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCrown, faClock, faHamburger, fas, faPaperPlane, faClose} from "@fortawesome/free-solid-svg-icons";
import {useEffect, useState} from "react";


const Menu = ({setTimeout}) => {


    return (
        <div className="menu">
            <div className='menu-close-control'>
                <FontAwesomeIcon
                    onClick={() => document.querySelector('.menu').classList.toggle('active')}

                    icon={faClose} size={'lg'} className="menu-close-control-icon"/>
            </div>
            <h2>Menu</h2>
            <ul className='menu-items'>
                <li className='menu-item'><FontAwesomeIcon icon={faCrown}  /> Score:{localStorage.getItem('wordChainHighScore')}</li>
                <li className='menu-item'><FontAwesomeIcon icon={faClock} />
                    <label htmlFor={'timeout'}> Set Timeout</label>
                    <select
                        onChange={(e) => setTimeout(Number(e.target.value))}
                        name="timeout" id="timeout" className="timeout">
                        <option value="10">10 seconds</option>
                        <option value="20">20 seconds</option>
                        <option value="30">30 seconds</option>
                    </select>

                </li>
                {/*<li className='menu-item'><FontAwesomeIcon icon={faPaperPlane} /> Contact me</li>*/}
            </ul>
        </div>
    )
}
export default Menu;