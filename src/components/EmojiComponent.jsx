import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import styled from 'styled-components';
import { MdOutlineEmojiEmotions } from 'react-icons/md';

const EmojiButton = styled(MdOutlineEmojiEmotions)`
    font-size: 2rem;
    margin-left: 0.75rem;
    opacity: 0.4;
    cursor: pointer;
`;

const PickerContainer = styled.div`
    position: absolute;
    bottom: 100%; 
    left: 400%; 
    transform: translateX(-50%); 
    margin-bottom: 8px; 
`;


const EmojiComponent = ({setMessage}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    const toggleEmojiPicker = () => {
        setShowEmojiPicker((prev) => !prev);
    };

    const handleEmojiClick = (emojiObject) => {
        const emoji = emojiObject.emoji;
        setMessage((prev) => prev + emoji);
    };

    // Close emoji picker when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    return (
        <div style={{ position: 'relative' }}>
            <EmojiButton onClick={toggleEmojiPicker} />
            {showEmojiPicker && (
                <PickerContainer ref={emojiPickerRef}>
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </PickerContainer>
            )}
        </div>
    );
};

export default EmojiComponent;
