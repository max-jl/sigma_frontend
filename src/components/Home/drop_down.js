import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { NavLink } from 'react-router-dom';


// dropDownLabel for the label for drop down
// items for items in the drop down
// hoverToShow property for drop down option show type, whether hover is enough or clicking
// showCurrentlySelected for the property to show the currently selected option

export default class ReactDropDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentlyChosen: "Hello World",
            showItems: false,
            hoverShow: this.props.hoverToShow,
        };
        this.wrapperRef = React.createRef();
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    componentDidMount() {
        if (this.state.hoverShow === false) {
            document.addEventListener("mousedown", this.handleClickOutside);
        }

    }

    componentWillUnmount() {
        if (this.state.hoverShow === false) {
            document.removeEventListener("mousedown", this.handleClickOutside);
        }
    }

    handleMoveOutside() {
        if (this.state.showItems === true) {
            this.setState({showItems:false})
        }
    }

    // Removes the items if clicked outside
    handleClickOutside(event) {
        if (this.wrapperRef && !this.wrapperRef.current.contains(event.target) && this.state.showItems === true) {
            this.setState({showItems: false});
        }
    }

    
    render() {
        let options = [];

        // if (this.props.showCurrentlySelected === true) {
        //     this.setState({currentlyChosen: "Hello World"})
        // }
        if (this.props.type === 'links') {
            for (const item of this.props.items) {
                options.push(
                    <li>
                        <NavLink
                            onClick={
                                () => {
                                    this.setState({
                                        showItems: false,
                                        currentlyChosen: item.label
                                    })
                                }
                            }
                            
                            to={ item.route }                    
                        >
                            { item.label }
                        </NavLink>
                    </li>
                )
            }
            options = 
            <ul 
                className='nav-link-list vertical'
            >
                {options}
            </ul>
        } else {
            for (const item of this.props.items) {
                options.push(
                    <option
                        value={ item.value }
                    >
                        { item.label }
                    </option>
                )
            }
        }

        
        return (
            <div
                className='drop-down'
                ref={ this.wrapperRef }
                onMouseEnter = {
                    () => {
                        if (this.props.hoverToShow === true) {
                            this.setState({showItems: true})
                        }
                    }
                }

                onMouseLeave = {
                    () => {
                        if (this.props.hoverToShow === true) {
                            this.setState({showItems: false})
                        }
                    }
                }
            >
                <label className='flex'            
                    onClick={
                        () => {
                            // changes state of show items
                            this.setState({
                                showItems: !this.state.showItems
                            })
                        }
                    }
                >
                    <div
                        className='drop-down-description'                    
                    >
                        { this.props.showCurrentlySelected? this.state.currentlyChosen : this.props.dropDownLabel }
                    </div>
                    <div
                        className = { this.state.showItems? 'chevron-icon flipped' : 'chevron-icon' }
                    >
                        <FontAwesomeIcon 
                            icon = { faChevronLeft }
                            size = "sm"
                        />
                    </div>
                </label>
                <div
                    className={this.state.showItems? 'drop-down-options show' : 'drop-down-options'}
                >
                    { this.state.showItems? options : undefined }                
                </div>
            </div>
        );
    };
}