import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { forwardRef as ForwardRef, useRef as UseRef } from "react";
import ReactToPrint, { PrintContextConsumer } from "react-to-print";
import { weekly_formatted } from "./tt_data";
import TT_WEEKLY from './tt_weekly2';

/*Module Obtained From
https://thewebdev.info/2021/11/20/how-to-print-a-react-component-on-click-of-a-button/
*/
const ComponentToPrint = ForwardRef((props, ref) => {
    return <div ref={ref}><TT_WEEKLY raw={props.weekly} /></div>;
});

export default function tt_display(props) {
    console.log(props.weekly)
    const ref = UseRef();
    
    return (
        <div className="timetable_weekly_print">
            <ReactToPrint content={() => ref.current}>
                <PrintContextConsumer>
                    {({ handlePrint }) => (
                        <div className="print_button_container">
                            <button 
                                className="clickable_button print_button" 
                                onClick={handlePrint}
                                title = "Print Full Timetable"
                            >
                                Print Timetable
                            </button>
                        </div>
                    )}
                </PrintContextConsumer>
            </ReactToPrint>
            <ComponentToPrint weekly={props.weekly} ref={ref} />
        </div>
    )
}