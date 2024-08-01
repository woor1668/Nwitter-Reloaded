import styled, { css } from 'styled-components';
import PostTweetForm from '../components/post-tweet-form';
import Timeline from '../components/timeline';
import { useRef, useState, useCallback } from 'react';
import { slideInFromTop, slideOutToTop } from '../css/animation';
import SvgIcon from '../components/svg';

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: 1fr 5fr;
    gap: 30px;
    overflow-y: auto; 

    &::-webkit-scrollbar {
        width: 0px;
        background: none;
    }
`;

const UpArrow = styled.div<{ $show: boolean }>`
    display: ${({ $show }) => ($show ? 'flex' : 'none')};
    justify-content: center;
    align-items: center;
    position: fixed;
    background-color: rgba(29, 155, 240);
    color: white;
    border: 3px solid white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    z-index: 1000;
    bottom: 30px;  /* Adjusted to be closer to the bottom */
    left: 50%;   /* Adjusted to be closer to the right edge */
    opacity: 0;
    animation: ${({ $show }) =>
        $show
            ? css`${slideInFromTop} 0.8s ease-out forwards`
            : css`${slideOutToTop} 0.8s ease-in forwards`};
    svg {
        width: 25px;
        height: 25px;
        stroke: white;
        stroke-width: 2;
    }
`;

export default function Home() {  
    const wrapperRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<any>(null);  // Use a ref to call fetchMoreTweets
    const [state, setState] = useState({
        isScroll: false,
        showUpArrow: false
    });
    const { isScroll, showUpArrow } = state;

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        setState(prevState => ({
            ...prevState,
            showUpArrow: scrollTop > 150
        }));
        if (scrollHeight - scrollTop <= clientHeight + 100 && scrollHeight - scrollTop >= clientHeight) {
            if (!isScroll) {
                setState(prevState => ({ ...prevState, isScroll: true }));
                if (timelineRef.current) {
                    timelineRef.current.fetchMoreTweets();
                }
                setState(prevState => ({ ...prevState, isScroll: false }));
            }
        }
    }, [isScroll]);

    const scrollToTop = () => {
        if (wrapperRef.current) {
            wrapperRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <Wrapper onScroll={handleScroll} ref={wrapperRef}>
            <PostTweetForm />
            <Timeline ref={timelineRef} />
            <UpArrow $show={showUpArrow} onClick={scrollToTop}>
                <SvgIcon name="up_arrow" />
            </UpArrow>
        </Wrapper>
    );
}
