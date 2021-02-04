import React from 'react'
import MonacoEditor from '@monaco-editor/react'

const Editor = ({ applicationCode, configuration }) => {
    const [code, setCode] = React.useState(configuration)
    const [options, setOptions] = React.useState({ selectOnLineNumbers: true })

    const editorDidMount = (editor, monaco) => {
        // setTimeout(() => monaco.getAction('editor.action.formatDocument').run(), 500)
    }

    const onChange = (newValue, e) => {
        setCode(newValue)
    }

    return (
        <MonacoEditor
            height={400}
            language="json"
            theme="vs-light"
            value={code}
            options={options}
            onChange={onChange}
            editorDidMount={editorDidMount}
        />
    )
}

export default Editor