import React from 'react'
import { Button } from 'antd'

const AnimatedIconButton = ({ icon, onClick, text, type = "default" }) => (
    <Button
        type='default'
        shape='square'
        icon={icon}
        onClick={onClick}>
        {text}
    </Button>
)

export { AnimatedIconButton }