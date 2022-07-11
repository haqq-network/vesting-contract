import React, {useState, useEffect} from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import file from './index.md';

const HaqqVestingDocs = () => {

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
        <div className={'ui segment'}>
            {markdown ?
                <ReactMarkdown
                    children={markdown}
                    remarkPlugins={[remarkGfm]}
                />
                : null
            }
        </div>
    );
}

export default HaqqVestingDocs;

