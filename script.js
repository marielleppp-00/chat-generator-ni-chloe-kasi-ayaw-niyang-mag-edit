/* ==========================================
   GROUP CHAT GENERATOR
========================================== */


/* ==========================================
   ELEMENTS
========================================== */

const groupNameInput =
    document.getElementById("groupName");

const conversationDateInput =
    document.getElementById("conversationDate");

const memberNameInput =
    document.getElementById("memberName");

const addMemberBtn =
    document.getElementById("addMemberBtn");

const memberList =
    document.getElementById("memberList");

const senderSelect =
    document.getElementById("senderSelect");

const messageInput =
    document.getElementById("messageInput");

const typingToggle =
    document.getElementById("typingToggle");

const addMessageBtn =
    document.getElementById("addMessageBtn");

const messageQueue =
    document.getElementById("messageQueue");

const clearMessagesBtn =
    document.getElementById("clearMessagesBtn");

const speedSelect =
    document.getElementById("speedSelect");

const soundToggle =
    document.getElementById("soundToggle");

const playBtn =
    document.getElementById("playBtn");

const pauseBtn =
    document.getElementById("pauseBtn");

const restartBtn =
    document.getElementById("restartBtn");

const recordBtn =
    document.getElementById("recordBtn");

const downloadBtn =
    document.getElementById("downloadBtn");

const recordingStatus =
    document.getElementById("recordingStatus");

const phoneGroupName =
    document.getElementById("phoneGroupName");

const headerAvatars =
    document.getElementById("headerAvatars");

const phoneTime =
    document.getElementById("phoneTime");

const chatArea =
    document.getElementById("chatArea");

const recordCanvas =
    document.getElementById("recordCanvas");


/* ==========================================
   DEFAULT DATA
========================================== */

let members = [
    "Marga",
    "Rea",
    "Bill",
    "Lee",
    "Wyn"
];


let messages = [

    {
        id: 1,
        sender: "Marga",
        text:
            "What if we go to the library and admire the artworks and books?",
        typing: true
    },

    {
        id: 2,
        sender: "You",
        text:
            "Oh! I like that idea!",
        typing: false
    },

    {
        id: 3,
        sender: "Rea",
        text:
            "Why don't we go to the library! Ambiance is great!",
        typing: true
    },

    {
        id: 4,
        sender: "Rea",
        text:
            "Perfect for studying!!!!",
        typing: true
    },

    {
        id: 5,
        sender: "Bill",
        text:
            "I will join you guys ONLY if we do study.",
        typing: true
    },

    {
        id: 6,
        sender: "Lee",
        text:
            "I'm down.",
        typing: true
    },

    {
        id: 7,
        sender: "Wyn",
        text:
            "👍",
        typing: true
    }

];


/* ==========================================
   PLAYBACK
========================================== */

let playIndex = 0;

let isPlaying = false;

let playbackTimer = null;

let waitResolver = null;


/* ==========================================
   RECORDING
========================================== */

let mediaRecorder = null;

let recordedChunks = [];

let recordedVideoBlob = null;

let recording = false;

let canvasAnimationId = null;

let recordingMimeType = "";

let recordingExtension = "webm";


/* ==========================================
   AUDIO
========================================== */

let audioContext = null;

let recordingAudioDestination = null;


/* ==========================================
   PHONE CLOCK
========================================== */

function updateClock() {

    const now =
        new Date();


    let hours =
        now.getHours();


    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    if (hours === 0) {

        hours = 12;

    }

    else if (hours > 12) {

        hours -= 12;

    }


    phoneTime.textContent =
        `${hours}:${minutes}`;

}


updateClock();

setInterval(
    updateClock,
    30000
);


/* ==========================================
   AUDIO CONTEXT
========================================== */

function ensureAudioContext() {

    if (!audioContext) {

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContextClass) {
            return false;
        }


        audioContext =
            new AudioContextClass();

    }


    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }


    return true;

}


/* ==========================================
   MESSAGE SOUND

   Generated completely in JavaScript.
   No MP3 required.
========================================== */

function playMessageSound() {

    if (!soundToggle.checked) {
        return;
    }


    if (!ensureAudioContext()) {
        return;
    }


    const now =
        audioContext.currentTime;


    /*
        Create two short tones.
    */

    createTone(
        880,
        now,
        0.12,
        0.09
    );


    createTone(
        1175,
        now + 0.055,
        0.13,
        0.07
    );

}


/* ==========================================
   CREATE TONE
========================================== */

function createTone(
    frequency,
    startTime,
    duration,
    volume
) {

    const oscillator =
        audioContext.createOscillator();


    const gain =
        audioContext.createGain();


    oscillator.type =
        "sine";


    oscillator.frequency.setValueAtTime(
        frequency,
        startTime
    );


    gain.gain.setValueAtTime(
        volume,
        startTime
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        startTime + duration
    );


    oscillator.connect(
        gain
    );


    /*
        Send audio to the speakers.
    */

    gain.connect(
        audioContext.destination
    );


    /*
        If we're recording, also send
        the sound into the video recorder.
    */

    if (
        recording &&
        recordingAudioDestination
    ) {

        gain.connect(
            recordingAudioDestination
        );

    }


    oscillator.start(
        startTime
    );


    oscillator.stop(
        startTime + duration
    );

}


/* ==========================================
   INITIAL
========================================== */

function getInitial(name) {

    if (!name) {
        return "?";
    }


    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


/* ==========================================
   GROUP SETTINGS
========================================== */

function updateGroupSettings() {

    const groupName =
        groupNameInput
            .value
            .trim();


    phoneGroupName.innerHTML =
        "";


    phoneGroupName.appendChild(
        document.createTextNode(
            groupName ||
            `${members.length + 1} People`
        )
    );


    const arrow =
        document.createElement(
            "span"
        );


    arrow.textContent =
        "›";


    phoneGroupName.appendChild(
        arrow
    );


    renderHeaderAvatars();

    saveData();

}


groupNameInput.addEventListener(
    "input",
    updateGroupSettings
);


conversationDateInput.addEventListener(
    "input",
    () => {

        restartConversation();

        saveData();

    }
);


/* ==========================================
   HEADER AVATARS
========================================== */

function renderHeaderAvatars() {

    headerAvatars.innerHTML =
        "";


    members
        .slice(0, 3)
        .forEach(
            member => {

                const avatar =
                    document.createElement(
                        "div"
                    );


                avatar.className =
                    "header-avatar";


                avatar.textContent =
                    getInitial(
                        member
                    );


                headerAvatars.appendChild(
                    avatar
                );

            }
        );

}


/* ==========================================
   MEMBERS
========================================== */

function renderMembers() {

    memberList.innerHTML =
        "";


    senderSelect.innerHTML =
        "";


    /* YOU */

    const youOption =
        document.createElement(
            "option"
        );


    youOption.value =
        "You";


    youOption.textContent =
        "You";


    senderSelect.appendChild(
        youOption
    );


    /* MEMBERS */

    members.forEach(
        (member, index) => {

            const chip =
                document.createElement(
                    "div"
                );


            chip.className =
                "member-chip";


            const name =
                document.createElement(
                    "span"
                );


            name.textContent =
                member;


            const remove =
                document.createElement(
                    "button"
                );


            remove.type =
                "button";


            remove.textContent =
                "×";


            remove.addEventListener(
                "click",
                () => {

                    pauseConversation();


                    members.splice(
                        index,
                        1
                    );


                    messages =
                        messages.filter(
                            message =>
                                message.sender
                                !==
                                member
                        );


                    renderMembers();

                    renderMessageQueue();

                    updateGroupSettings();

                    restartConversation();

                    saveData();

                }
            );


            chip.appendChild(
                name
            );


            chip.appendChild(
                remove
            );


            memberList.appendChild(
                chip
            );


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                member;


            option.textContent =
                member;


            senderSelect.appendChild(
                option
            );

        }
    );


    renderHeaderAvatars();

}


/* ==========================================
   ADD MEMBER
========================================== */

function addMember() {

    const name =
        memberNameInput
            .value
            .trim();


    if (!name) {
        return;
    }


    if (
        name.toLowerCase() ===
        "you"
    ) {

        alert(
            '"You" already exists.'
        );

        return;

    }


    const exists =
        members.some(
            member =>
                member
                    .toLowerCase()
                ===
                name.toLowerCase()
        );


    if (exists) {

        alert(
            "That member already exists."
        );

        return;

    }


    members.push(
        name
    );


    memberNameInput.value =
        "";


    renderMembers();

    updateGroupSettings();

    saveData();

}


addMemberBtn.addEventListener(
    "click",
    addMember
);


memberNameInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            addMember();

        }

    }
);


/* ==========================================
   ADD MESSAGE
========================================== */

function addMessage() {

    const text =
        messageInput
            .value
            .trim();


    if (!text) {

        alert(
            "Type a message first."
        );

        return;

    }


    messages.push({

        id:
            Date.now(),

        sender:
            senderSelect.value,

        text:
            text,

        typing:
            typingToggle.checked

    });


    messageInput.value =
        "";


    renderMessageQueue();

    saveData();


    messageInput.focus();

}


addMessageBtn.addEventListener(
    "click",
    addMessage
);


messageInput.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            addMessage();

        }

    }
);


/* ==========================================
   QUEUE
========================================== */

function renderMessageQueue() {

    messageQueue.innerHTML =
        "";


    if (
        messages.length ===
        0
    ) {

        const empty =
            document.createElement(
                "p"
            );


        empty.textContent =
            "No messages yet.";


        messageQueue.appendChild(
            empty
        );


        return;

    }


    messages.forEach(
        (message, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "queue-message";


            const number =
                document.createElement(
                    "div"
                );


            number.className =
                "queue-number";


            number.textContent =
                index + 1;


            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "queue-content";


            const sender =
                document.createElement(
                    "strong"
                );


            sender.textContent =
                message.sender;


            const text =
                document.createElement(
                    "span"
                );


            text.textContent =
                message.text;


            content.appendChild(
                sender
            );


            content.appendChild(
                text
            );


            const remove =
                document.createElement(
                    "button"
                );


            remove.type =
                "button";


            remove.className =
                "queue-delete";


            remove.textContent =
                "×";


            remove.addEventListener(
                "click",
                () => {

                    pauseConversation();


                    messages.splice(
                        index,
                        1
                    );


                    renderMessageQueue();

                    restartConversation();

                    saveData();

                }
            );


            row.appendChild(
                number
            );


            row.appendChild(
                content
            );


            row.appendChild(
                remove
            );


            messageQueue.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   CLEAR
========================================== */

clearMessagesBtn.addEventListener(
    "click",
    () => {

        if (
            messages.length ===
            0
        ) {
            return;
        }


        if (
            !confirm(
                "Clear the entire conversation?"
            )
        ) {
            return;
        }


        messages =
            [];


        renderMessageQueue();

        restartConversation();

        saveData();

    }
);


/* ==========================================
   AVATAR
========================================== */

function createAvatar(
    sender,
    className
) {

    const avatar =
        document.createElement(
            "div"
        );


    avatar.className =
        className;


    avatar.textContent =
        getInitial(
            sender
        );


    return avatar;

}


/* ==========================================
   MESSAGE ELEMENT
========================================== */

function createMessageElement(
    message,
    index
) {

    const isMe =
        message.sender ===
        "You";


    const row =
        document.createElement(
            "div"
        );


    row.className =
        `message-row ${
            isMe
                ?
                "me"
                :
                "other"
        }`;


    const previous =
        messages[
            index - 1
        ];


    const samePreviousSender =
        previous &&
        previous.sender ===
        message.sender;


    if (!isMe) {

        if (
            samePreviousSender
        ) {

            const spacer =
                document.createElement(
                    "div"
                );


            spacer.className =
                "avatar-spacer";


            row.appendChild(
                spacer
            );

        }

        else {

            row.appendChild(
                createAvatar(
                    message.sender,
                    "message-avatar"
                )
            );

        }

    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "message-wrapper";


    if (
        !isMe &&
        !samePreviousSender
    ) {

        const sender =
            document.createElement(
                "div"
            );


        sender.className =
            "sender-name";


        sender.textContent =
            message.sender;


        wrapper.appendChild(
            sender
        );

    }


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "message-bubble";


    bubble.textContent =
        message.text;


    wrapper.appendChild(
        bubble
    );


    row.appendChild(
        wrapper
    );


    return row;

}


/* ==========================================
   TYPING
========================================== */

function createTypingIndicator(
    message
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "typing-row";


    row.appendChild(
        createAvatar(
            message.sender,
            "typing-avatar"
        )
    );


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "typing-bubble";


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const dot =
            document.createElement(
                "i"
            );


        bubble.appendChild(
            dot
        );

    }


    row.appendChild(
        bubble
    );


    return row;

}


/* ==========================================
   WAIT
========================================== */

function wait(milliseconds) {

    return new Promise(
        resolve => {

            waitResolver =
                resolve;


            playbackTimer =
                setTimeout(
                    () => {

                        playbackTimer =
                            null;

                        waitResolver =
                            null;

                        resolve();

                    },

                    milliseconds
                );

        }
    );

}


/* ==========================================
   CANCEL WAIT
========================================== */

function cancelWait() {

    if (
        playbackTimer !==
        null
    ) {

        clearTimeout(
            playbackTimer
        );


        playbackTimer =
            null;

    }


    if (
        waitResolver
    ) {

        const resolve =
            waitResolver;


        waitResolver =
            null;


        resolve();

    }

}


/* ==========================================
   SCROLL
========================================== */

function scrollChat() {

    chatArea.scrollTo({

        top:
            chatArea.scrollHeight,

        behavior:
            "smooth"

    });

}


/* ==========================================
   PLAY
========================================== */

async function playConversation() {

    if (
        isPlaying
    ) {
        return;
    }


    if (
        messages.length ===
        0
    ) {

        alert(
            "Add messages first."
        );

        return;

    }


    ensureAudioContext();


    if (
        playIndex >=
        messages.length
    ) {

        restartConversation();

    }


    isPlaying =
        true;


    const startMessage =
        document.getElementById(
            "startMessage"
        );


    if (
        startMessage
    ) {

        startMessage.remove();

    }


    while (
        playIndex <
        messages.length
    ) {

        if (
            !isPlaying
        ) {
            return;
        }


        const currentIndex =
            playIndex;


        const message =
            messages[
                currentIndex
            ];


        /*
            TYPING
        */

        if (
            message.typing &&
            message.sender !==
            "You"
        ) {

            const typing =
                createTypingIndicator(
                    message
                );


            chatArea.appendChild(
                typing
            );


            scrollChat();


            const typingTime =
                Math.min(
                    Number(
                        speedSelect.value
                    ) * .65,
                    1200
                );


            await wait(
                typingTime
            );


            if (
                typing.parentNode
            ) {

                typing.remove();

            }


            if (
                !isPlaying
            ) {

                return;

            }

        }


        /*
            MESSAGE
        */

        const element =
            createMessageElement(
                message,
                currentIndex
            );


        chatArea.appendChild(
            element
        );


        playMessageSound();


        playIndex++;


        scrollChat();


        if (
            playIndex <
            messages.length
        ) {

            await wait(
                Number(
                    speedSelect.value
                )
            );


            if (
                !isPlaying
            ) {

                return;

            }

        }

    }


    isPlaying =
        false;


    /*
        If recording, allow the last
        message to remain visible briefly.
    */

    if (
        recording
    ) {

        await wait(
            1000
        );


        stopRecording();

    }

}


/* ==========================================
   PAUSE
========================================== */

function pauseConversation() {

    isPlaying =
        false;


    cancelWait();


    const typing =
        chatArea.querySelector(
            ".typing-row"
        );


    if (
        typing
    ) {

        typing.remove();

    }

}


/* ==========================================
   RESTART
========================================== */

function restartConversation() {

    pauseConversation();


    playIndex =
        0;


    chatArea.innerHTML =
        "";


    const date =
        document.createElement(
            "div"
        );


    date.className =
        "date-separator";


    date.textContent =
        conversationDateInput
            .value
            .trim()
        ||
        "Today";


    chatArea.appendChild(
        date
    );


    const start =
        document.createElement(
            "div"
        );


    start.id =
        "startMessage";


    start.className =
        "start-message";


    start.innerHTML =
        "Press <strong>Play</strong> to start the conversation.";


    chatArea.appendChild(
        start
    );

}


/* ==========================================
   BUTTON EVENTS
========================================== */

playBtn.addEventListener(
    "click",
    () => {

        ensureAudioContext();

        playConversation();

    }
);


pauseBtn.addEventListener(
    "click",
    pauseConversation
);


restartBtn.addEventListener(
    "click",
    restartConversation
);


/* ==========================================
   VIDEO RECORDING
========================================== */


/*
    Choose the best MediaRecorder format
    supported by the browser.
*/

function getRecordingFormat() {

    if (
        typeof MediaRecorder ===
        "undefined"
    ) {

        return null;

    }


    const formats = [

        {
            mime:
                "video/mp4;codecs=avc1",
            extension:
                "mp4"
        },

        {
            mime:
                "video/webm;codecs=vp9,opus",
            extension:
                "webm"
        },

        {
            mime:
                "video/webm;codecs=vp8,opus",
            extension:
                "webm"
        },

        {
            mime:
                "video/webm",
            extension:
                "webm"
        }

    ];


    for (
        const format
        of formats
    ) {

        if (
            MediaRecorder.isTypeSupported(
                format.mime
            )
        ) {

            return format;

        }

    }


    return {

        mime: "",
        extension:
            "webm"

    };

}


/* ==========================================
   CANVAS DRAWING
========================================== */

function roundRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
) {

    const r =
        Math.min(
            radius,
            width / 2,
            height / 2
        );


    ctx.beginPath();

    ctx.moveTo(
        x + r,
        y
    );


    ctx.arcTo(
        x + width,
        y,
        x + width,
        y + height,
        r
    );


    ctx.arcTo(
        x + width,
        y + height,
        x,
        y + height,
        r
    );


    ctx.arcTo(
        x,
        y + height,
        x,
        y,
        r
    );


    ctx.arcTo(
        x,
        y,
        x + width,
        y,
        r
    );


    ctx.closePath();

}


/* ==========================================
   WRAP TEXT
========================================== */

function wrapCanvasText(
    ctx,
    text,
    maxWidth
) {

    const paragraphs =
        String(text)
            .split("\n");


    const lines =
        [];


    paragraphs.forEach(
        paragraph => {

            const words =
                paragraph.split(
                    " "
                );


            let line =
                "";


            words.forEach(
                word => {

                    const test =
                        line
                        ?
                        `${line} ${word}`
                        :
                        word;


                    if (
                        ctx.measureText(
                            test
                        ).width >
                        maxWidth
                        &&
                        line
                    ) {

                        lines.push(
                            line
                        );


                        line =
                            word;

                    }

                    else {

                        line =
                            test;

                    }

                }
            );


            if (
                line
            ) {

                lines.push(
                    line
                );

            }

        }
    );


    return lines;

}


/* ==========================================
   DRAW RECORDING FRAME

   This creates a clean vertical phone/chat
   video without recording the editor.
========================================== */

function drawRecordingFrame() {

    const ctx =
        recordCanvas.getContext(
            "2d"
        );


    const W =
        recordCanvas.width;


    const H =
        recordCanvas.height;


    /*
        BACKGROUND
    */

    ctx.fillStyle =
        "#ffffff";


    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
        STATUS BAR
    */

    ctx.fillStyle =
        "#f8f8fa";


    ctx.fillRect(
        0,
        0,
        W,
        110
    );


    ctx.fillStyle =
        "#000";


    ctx.font =
        "bold 34px Arial";


    ctx.fillText(
        phoneTime.textContent,
        58,
        70
    );


    /*
        SIMPLE STATUS ICONS
    */

    ctx.font =
        "28px Arial";


    ctx.fillText(
        "▮▮▮  ◉  ▰",
        555,
        70
    );


    /*
        HEADER
    */

    ctx.fillStyle =
        "#f8f8fa";


    ctx.fillRect(
        0,
        110,
        W,
        215
    );


    ctx.strokeStyle =
        "#cccccc";


    ctx.beginPath();

    ctx.moveTo(
        0,
        325
    );

    ctx.lineTo(
        W,
        325
    );

    ctx.stroke();


    /*
        BACK BUTTON
    */

    ctx.fillStyle =
        "#007aff";


    ctx.font =
        "70px Arial";


    ctx.fillText(
        "‹",
        35,
        250
    );


    /*
        UNREAD
    */

    ctx.fillStyle =
        "#007aff";


    roundRect(
        ctx,
        92,
        191,
        65,
        48,
        25
    );


    ctx.fill();


    ctx.fillStyle =
        "#fff";


    ctx.font =
        "26px Arial";


    ctx.textAlign =
        "center";


    ctx.fillText(
        "92",
        124,
        224
    );


    /*
        HEADER AVATARS
    */

    const headerMembers =
        members.slice(
            0,
            3
        );


    const avatarPositions = [

        {
            x: 355,
            y: 165,
            r: 48
        },

        {
            x: 440,
            y: 200,
            r: 43
        },

        {
            x: 400,
            y: 250,
            r: 32
        }

    ];


    headerMembers.forEach(
        (member, index) => {

            const position =
                avatarPositions[
                    index
                ];


            ctx.beginPath();


            ctx.fillStyle =
                "#9da3ae";


            ctx.arc(
                position.x,
                position.y,
                position.r,
                0,
                Math.PI * 2
            );


            ctx.fill();


            ctx.fillStyle =
                "#fff";


            ctx.font =
                `bold ${
                    position.r * .8
                }px Arial`;


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.fillText(
                getInitial(
                    member
                ),
                position.x,
                position.y + 2
            );

        }
    );


    /*
        GROUP NAME
    */

    ctx.fillStyle =
        "#111";


    ctx.font =
        "30px Arial";


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "alphabetic";


    ctx.fillText(
        groupNameInput
            .value
            .trim()
        ||
        `${members.length + 1} People`,
        W / 2,
        310
    );


    /*
        VIDEO ICON
    */

    ctx.strokeStyle =
        "#007aff";


    ctx.lineWidth =
        5;


    roundRect(
        ctx,
        680,
        195,
        55,
        45,
        8
    );


    ctx.stroke();


    /*
        CHAT BACKGROUND
    */

    ctx.fillStyle =
        "#fff";


    ctx.fillRect(
        0,
        326,
        W,
        1135
    );


    /*
        DATE
    */

    ctx.fillStyle =
        "#8e8e93";


    ctx.font =
        "28px Arial";


    ctx.textAlign =
        "center";


    ctx.fillText(
        conversationDateInput
            .value
            .trim()
        ||
        "Today",
        W / 2,
        380
    );


    /*
        DRAW CURRENTLY VISIBLE MESSAGES

        We draw messages according to
        playIndex, matching playback.
    */

    const visibleMessages =
        messages.slice(
            0,
            playIndex
        );


    let y =
        425;


    const bubbleFont =
        32;


    visibleMessages.forEach(
        (message, index) => {

            ctx.font =
                `${bubbleFont}px Arial`;


            const isMe =
                message.sender ===
                "You";


            const maxBubbleWidth =
                535;


            const textLines =
                wrapCanvasText(
                    ctx,
                    message.text,
                    maxBubbleWidth - 45
                );


            const lineHeight =
                39;


            const bubbleHeight =
                Math.max(
                    62,
                    textLines.length *
                    lineHeight +
                    27
                );


            /*
                If messages extend beyond
                the visible chat region,
                move everything upward.
            */

            if (
                y + bubbleHeight >
                1360
            ) {

                y -=
                    (
                        y +
                        bubbleHeight -
                        1360
                    );

            }


            if (!isMe) {

                /*
                    SENDER NAME
                */

                ctx.fillStyle =
                    "#8e8e93";


                ctx.font =
                    "24px Arial";


                ctx.textAlign =
                    "left";


                ctx.fillText(
                    message.sender,
                    118,
                    y
                );


                y +=
                    14;


                /*
                    AVATAR
                */

                ctx.beginPath();


                ctx.fillStyle =
                    "#9da3ae";


                ctx.arc(
                    65,
                    y + 42,
                    32,
                    0,
                    Math.PI * 2
                );


                ctx.fill();


                ctx.fillStyle =
                    "#fff";


                ctx.font =
                    "bold 25px Arial";


                ctx.textAlign =
                    "center";


                ctx.textBaseline =
                    "middle";


                ctx.fillText(
                    getInitial(
                        message.sender
                    ),
                    65,
                    y + 43
                );


                /*
                    BUBBLE
                */

                ctx.font =
                    `${bubbleFont}px Arial`;


                let bubbleWidth =
                    0;


                textLines.forEach(
                    line => {

                        bubbleWidth =
                            Math.max(
                                bubbleWidth,
                                ctx.measureText(
                                    line
                                ).width
                            );

                    }
                );


                bubbleWidth =
                    Math.min(
                        maxBubbleWidth,
                        bubbleWidth + 45
                    );


                ctx.fillStyle =
                    "#e9e9eb";


                roundRect(
                    ctx,
                    105,
                    y,
                    bubbleWidth,
                    bubbleHeight,
                    34
                );


                ctx.fill();


                ctx.fillStyle =
                    "#000";


                ctx.textAlign =
                    "left";


                ctx.textBaseline =
                    "alphabetic";


                textLines.forEach(
                    (line, lineIndex) => {

                        ctx.fillText(
                            line,
                            128,
                            y +
                            44 +
                            lineIndex *
                            lineHeight
                        );

                    }
                );

            }

            else {

                ctx.font =
                    `${bubbleFont}px Arial`;


                let bubbleWidth =
                    0;


                textLines.forEach(
                    line => {

                        bubbleWidth =
                            Math.max(
                                bubbleWidth,
                                ctx.measureText(
                                    line
                                ).width
                            );

                    }
                );


                bubbleWidth =
                    Math.min(
                        maxBubbleWidth,
                        bubbleWidth + 45
                    );


                const x =
                    W -
                    bubbleWidth -
                    32;


                ctx.fillStyle =
                    "#0b84ff";


                roundRect(
                    ctx,
                    x,
                    y,
                    bubbleWidth,
                    bubbleHeight,
                    34
                );


                ctx.fill();


                ctx.fillStyle =
                    "#fff";


                ctx.textAlign =
                    "left";


                ctx.textBaseline =
                    "alphabetic";


                textLines.forEach(
                    (line, lineIndex) => {

                        ctx.fillText(
                            line,
                            x + 23,
                            y +
                            44 +
                            lineIndex *
                            lineHeight
                        );

                    }
                );

            }


            y +=
                bubbleHeight +
                28;

        }
    );


    /*
        TYPING INDICATOR

        If the live DOM currently contains
        typing, show it in the video too.
    */

    const typing =
        chatArea.querySelector(
            ".typing-row"
        );


    if (
        typing
    ) {

        ctx.fillStyle =
            "#e9e9eb";


        roundRect(
            ctx,
            105,
            Math.min(
                y,
                1350
            ),
            110,
            65,
            32
        );


        ctx.fill();


        ctx.fillStyle =
            "#8e8e93";


        const dotY =
            Math.min(
                y,
                1350
            ) + 33;


        [
            135,
            160,
            185
        ].forEach(
            dotX => {

                ctx.beginPath();

                ctx.arc(
                    dotX,
                    dotY,
                    7,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

            }
        );

    }


    /*
        COMPOSER
    */

    ctx.fillStyle =
        "#fafafa";


    ctx.fillRect(
        0,
        1460,
        W,
        140
    );


    /*
        PLUS
    */

    ctx.beginPath();


    ctx.fillStyle =
        "#e7e7eb";


    ctx.arc(
        70,
        1510,
        35,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.fillStyle =
        "#777";


    ctx.font =
        "45px Arial";


    ctx.textAlign =
        "center";


    ctx.fillText(
        "+",
        70,
        1525
    );


    /*
        INPUT
    */

    ctx.strokeStyle =
        "#d3d3d6";


    ctx.lineWidth =
        3;


    roundRect(
        ctx,
        125,
        1474,
        580,
        72,
        36
    );


    ctx.stroke();


    ctx.fillStyle =
        "#c5c5c7";


    ctx.font =
        "28px Arial";


    ctx.textAlign =
        "left";


    ctx.fillText(
        "iMessage",
        155,
        1521
    );


    /*
        HOME INDICATOR
    */

    ctx.fillStyle =
        "#000";


    roundRect(
        ctx,
        270,
        1570,
        240,
        10,
        6
    );


    ctx.fill();

}


/* ==========================================
   RECORDING FRAME LOOP
========================================== */

function recordingFrameLoop() {

    if (
        !recording
    ) {
        return;
    }


    drawRecordingFrame();


    canvasAnimationId =
        requestAnimationFrame(
            recordingFrameLoop
        );

}


/* ==========================================
   START RECORDING
========================================== */

async function startRecording() {

    if (
        recording
    ) {
        return;
    }


    if (
        messages.length ===
        0
    ) {

        alert(
            "Add messages first."
        );

        return;

    }


    if (
        !recordCanvas.captureStream
    ) {

        alert(
            "Video recording is not supported by this browser. Try Chrome or Edge on desktop."
        );

        return;

    }


    const format =
        getRecordingFormat();


    if (!format) {

        alert(
            "MediaRecorder is not supported by this browser."
        );

        return;

    }


    ensureAudioContext();


    restartConversation();


    recordedChunks =
        [];


    recordedVideoBlob =
        null;


    downloadBtn.disabled =
        true;


    recordingMimeType =
        format.mime;


    recordingExtension =
        format.extension;


    /*
        DRAW INITIAL FRAME
    */

    drawRecordingFrame();


    /*
        CANVAS VIDEO STREAM
    */

    const canvasStream =
        recordCanvas.captureStream(
            30
        );


    /*
        CREATE COMBINED STREAM
    */

    const combinedStream =
        new MediaStream();


    canvasStream
        .getVideoTracks()
        .forEach(
            track => {

                combinedStream.addTrack(
                    track
                );

            }
        );


    /*
        AUDIO TRACK
    */

    if (
        audioContext &&
        audioContext
            .createMediaStreamDestination
    ) {

        recordingAudioDestination =
            audioContext
                .createMediaStreamDestination();


        recordingAudioDestination
            .stream
            .getAudioTracks()
            .forEach(
                track => {

                    combinedStream.addTrack(
                        track
                    );

                }
            );

    }


    /*
        RECORDER
    */

    try {

        const options =
            recordingMimeType
            ?
            {
                mimeType:
                    recordingMimeType,

                videoBitsPerSecond:
                    5000000
            }
            :
            {
                videoBitsPerSecond:
                    5000000
            };


        mediaRecorder =
            new MediaRecorder(
                combinedStream,
                options
            );

    }

    catch (error) {

        console.error(
            error
        );


        mediaRecorder =
            new MediaRecorder(
                combinedStream
            );


        recordingMimeType =
            mediaRecorder.mimeType ||
            "video/webm";


        recordingExtension =
            recordingMimeType
                .includes("mp4")
            ?
            "mp4"
            :
            "webm";

    }


    mediaRecorder.addEventListener(
        "dataavailable",
        event => {

            if (
                event.data &&
                event.data.size >
                0
            ) {

                recordedChunks.push(
                    event.data
                );

            }

        }
    );


    mediaRecorder.addEventListener(
        "stop",
        () => {

            recordedVideoBlob =
                new Blob(
                    recordedChunks,
                    {
                        type:
                            mediaRecorder.mimeType
                            ||
                            recordingMimeType
                            ||
                            "video/webm"
                    }
                );


            downloadBtn.disabled =
                false;


            recordingStatus.textContent =
                "Recording complete ✓";


            recordingStatus.classList.remove(
                "active"
            );


            recordBtn.disabled =
                false;


            recordBtn.textContent =
                "● Record & Play";

        }
    );


    recording =
        true;


    recordingStatus.textContent =
        "● Recording conversation...";


    recordingStatus.classList.add(
        "active"
    );


    recordBtn.disabled =
        true;


    recordBtn.textContent =
        "Recording...";


    mediaRecorder.start(
        250
    );


    recordingFrameLoop();


    /*
        SMALL LEAD-IN BEFORE FIRST MESSAGE
    */

    await wait(
        700
    );


    playConversation();

}


/* ==========================================
   STOP RECORDING
========================================== */

function stopRecording() {

    if (
        !recording
    ) {
        return;
    }


    /*
        Draw final frame before stopping.
    */

    drawRecordingFrame();


    recording =
        false;


    if (
        canvasAnimationId
    ) {

        cancelAnimationFrame(
            canvasAnimationId
        );


        canvasAnimationId =
            null;

    }


    if (
        mediaRecorder &&
        mediaRecorder.state !==
        "inactive"
    ) {

        mediaRecorder.stop();

    }


    recordingAudioDestination =
        null;

}


/* ==========================================
   RECORD BUTTON
========================================== */

recordBtn.addEventListener(
    "click",
    startRecording
);


/* ==========================================
   DOWNLOAD VIDEO
========================================== */

downloadBtn.addEventListener(
    "click",
    () => {

        if (
            !recordedVideoBlob
        ) {
            return;
        }


        const url =
            URL.createObjectURL(
                recordedVideoBlob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            `group-chat.${
                recordingExtension
            }`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },

            1000
        );

    }
);


/* ==========================================
   SAVE
========================================== */

function saveData() {

    const data = {

        groupName:
            groupNameInput.value,

        conversationDate:
            conversationDateInput.value,

        members:
            members,

        messages:
            messages,

        sound:
            soundToggle.checked

    };


    try {

        localStorage.setItem(
            "groupChatGeneratorV3",
            JSON.stringify(
                data
            )
        );

    }

    catch (error) {

        console.error(
            "Save failed:",
            error
        );

    }

}


/* ==========================================
   LOAD
========================================== */

function loadData() {

    const saved =
        localStorage.getItem(
            "groupChatGeneratorV3"
        );


    if (!saved) {
        return;
    }


    try {

        const data =
            JSON.parse(
                saved
            );


        if (
            typeof
            data.groupName ===
            "string"
        ) {

            groupNameInput.value =
                data.groupName;

        }


        if (
            typeof
            data.conversationDate ===
            "string"
        ) {

            conversationDateInput.value =
                data.conversationDate;

        }


        if (
            Array.isArray(
                data.members
            )
        ) {

            members =
                data.members;

        }


        if (
            Array.isArray(
                data.messages
            )
        ) {

            messages =
                data.messages;

        }


        if (
            typeof
            data.sound ===
            "boolean"
        ) {

            soundToggle.checked =
                data.sound;

        }

    }

    catch (error) {

        console.error(
            "Load failed:",
            error
        );

    }

}


/* ==========================================
   SAVE SOUND SETTING
========================================== */

soundToggle.addEventListener(
    "change",
    saveData
);


/* ==========================================
   INITIALIZE
========================================== */

loadData();

renderMembers();

renderMessageQueue();

updateGroupSettings();

restartConversation();