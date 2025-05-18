import {faBars} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


export default function MenuControl() {

    return (
        <div className="menu-control">
            <FontAwesomeIcon
                onClick={() => document.querySelector('.menu').classList.toggle('active')}
                icon={faBars} size={'lg'} className="menu-control-icon"/>
        </div>
    )
}