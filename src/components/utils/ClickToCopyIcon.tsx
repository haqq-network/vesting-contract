import React, {useState} from "react";
// import {faClipboard, faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconDefinition, faClipboard, faCheckCircle} from "@fortawesome/free-regular-svg-icons";

type ClickToCopyIconProps = {
    textToCopy: string
}

const ClickToCopyIcon: React.FC<ClickToCopyIconProps> = (props) => {

    const initialIconTitle = 'Click to copy address to clipboard';
    const clickedIconTitle = 'Copied!';

    const iconStyle = {
        cursor: 'pointer'
    };

    const [icon, setIcon] = useState<IconDefinition>(faClipboard);
    const [iconTitle, setIconTitle] = useState<string>(initialIconTitle);

    const setIconClicked = () => {
        setIcon(faCheckCircle);
        setIconTitle(clickedIconTitle);
    };

    const revertIconToInitialState = () => {
        setIcon(faClipboard);
        setIconTitle(initialIconTitle);
    };

    const clickToCopyHandler = () => {
        navigator.clipboard.writeText(props.textToCopy) // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
            .then(() => {
                setIconClicked();
                setTimeout(revertIconToInitialState, 1000);
            })
            .catch(() => {
                console.error('error coping text to clipboard');
            })
    };

    return (

        <span>
     <FontAwesomeIcon icon={icon}
                      onClick={clickToCopyHandler}
                      style={iconStyle}
                      title={iconTitle}
     />
</span>

    );

}

export default ClickToCopyIcon;