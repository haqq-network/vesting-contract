import React, {useEffect, useState} from 'react';
// import {Segment} from "semantic-ui-react";
import file from './readme.md';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const HomePage: React.FC = (props) => {

    const [markdown, setMarkdown] = useState<string>();

    useEffect(() => {
        fetch(file)
            .then(res => {
                return res.text();
            })
            .then((text) => {
                // console.log(text);
                setMarkdown(text);
            })
            .catch(error => {
                console.log(error);
            })
    }, []);

    return (
        <div className={"ui segment"}>
            {markdown ?
                <ReactMarkdown
                    children={markdown}
                    remarkPlugins={[remarkGfm]}
                />
                : null
            }
        </div>
    );
};
export default HomePage;

