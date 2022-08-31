import About from '../../components/Home/about/about';
import Full_calendar from '../../components/Home/calendar/calendar_full';
import Dashboard from '../../components/Home/dashboard';
import ReactDropDown from '../../components/Home/drop_down';
import Feedback from '../../components/Home/feedback/feedback';
import Focus from '../../components/Home/focus/focus';
import Footer from '../../components/Home/footer';
import Motivational_quote from '../../components/Home/quote/motivational_quote';
import logo from '../../res/images/Logo-Vector-Graphics.svg';
import { check_mobile } from '../../res/scripts/check_mobile';
import '../../res/styles/index.css';

import {
    Link,
    NavLink, Route, Routes
} from "react-router-dom";

function Home(props) {
    console.log(props)
    let links = (
        <nav>
            <ul className='link_list'>
            <li>
                <NavLink
                to={"/about"}
                tabIndex={1}>
                    About
                </NavLink>
            </li>
            <li>
                <NavLink
                to={"/calendar"}
                tabIndex={1}>
                    Calendar
                </NavLink>
            </li>
            <li>
                <NavLink
                to={"/focus"}>
                Focus
                </NavLink>
            </li>
            <li>
                <NavLink
                to={"/feedback"}>
                    Feedback
                </NavLink>
            </li>
            <li>
                <NavLink
                    to={"/quote_of_the_day"}>
                    Quote of the Day
                </NavLink>
            </li>
            </ul>
            <button className='clickable_button logout_button'
                    onClick={() => {
                        localStorage.clear();
                        window.location.assign("/");
                    }}>
                        Logout
            </button>
        </nav>
    )

    // If mobile
    if (check_mobile()) {
        links = (
            <div>
                <nav className='drop_down_nav'>
                <ReactDropDown
                    dropDownLabel="Services"
                    items={[
                        {
                        label: 'About',
                        route: '/about'
                        },
                        {
                        label: 'Calendar',
                        route: '/calendar'
                        },
                        {
                        label: 'Feedback',
                        route: '/feedback'
                        },
                        {
                        label: "Focus",
                        route: "/focus"
                        }
                    ]}
                    showCurrentlySelected = {false}
                    type="links"
                    hoverToShow = { false }
                    />
                    <ul className='link_list'>
                    <li>
                        <NavLink
                        to={'/quote_of_the_day'}
                        >
                        Quote of the Day
                        </NavLink>
                    </li>

                    </ul>
                </nav>
            </div>
        )
    }

    return (
        <div className='App'>
            <header className='navigation'>
            <div className='flex header'>
                <a href=''>
                <Link to="/"
                    tabIndex={-1}>
                    <img src={logo}
                    className='logo'
                    alt='logo for Sigma'
                    title='Return home'
                    aria-hidden='true'>
                    </img>
                </Link>
                </a>
                { links }

            </div>
            </header>
            <main>

            <Routes>
                <Route exact path="/" element={<Dashboard weekly={props.weekly} daily={props.daily}/>} />
                <Route exact path='/focus' element = {<Focus />} />
                <Route exact path='/quote_of_the_day' element = {<Motivational_quote />} />
                <Route path="/calendar" element={<Full_calendar />} exact />
                <Route path='/about' element={<About />} exact />
                <Route path='/feedback' element={<Feedback />} exact />
                <Route path='/callback' element={<Dashboard weekly={props.weekly} daily={props.daily}/>} exact />
            </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default Home;