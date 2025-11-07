import React, { useMemo } from "react";
import type { EditorProps } from "@monaco-editor/react";
import MonacoEditor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { makeDecoratable } from "~/utils.js";

interface CodeEditorPrimitiveProps extends Partial<EditorProps> {
    disabled?: boolean;
}

const monacoOptions: editor.IEditorConstructionOptions = {
    readOnly: false,
    minimap: {
        enabled: false
    }
};

const DecoratableCodeEditorPrimitive = ({
    value,
    disabled,
    options: optionsInput,
    ...rest
}: CodeEditorPrimitiveProps) => {
    // Editor is readonly if it's explicitly disabled, or if there's no `onChange` passed via props.
    const readOnly = [disabled, rest.onChange].filter(Boolean).length === 0;

    const options = useMemo((): editor.IDiffEditorConstructionOptions => {
        return {
            ...monacoOptions,
            ...optionsInput,
            domReadOnly: readOnly,
            readOnly
        };
    }, [disabled, rest.onChange]);

    return (
        <MonacoEditor
            height={"calc(100vh - 400px)"}
            language={"json"}
            defaultValue={value}
            options={options}
            {...rest}
        />
    );
};

const CodeEditorPrimitive = makeDecoratable("CodeEditorPrimitive", DecoratableCodeEditorPrimitive);

export { CodeEditorPrimitive, type CodeEditorPrimitiveProps };
