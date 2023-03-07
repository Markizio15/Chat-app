const CHANNEL_ID = 'KawNF43A8EArvlrl';

const drone = new ScaleDrone(CHANNEL_ID, {
    data: { // Will be sent out as clientData via events
        name: getRandomName(),
        color: getRandomColor(),
    },
});

let members = [];

drone.on('open', error => {
    if (error) {
        return console.error(error);
    }
    console.log('Successfully connected to Scaledrone');

    const room = drone.subscribe('observable-room');
    room.on('open', error => {
        if (error) {
            return console.error(error);
        }
        console.log('Successfully joined room');
    });

    room.on('members', m => {
        members = m;
        updateMembersDOM();
    });

    room.on('member_join', member => {
        members.push(member);
        updateMembersDOM();
    });

    room.on('member_leave', ({ id }) => {
        const index = members.findIndex(member => member.id === id);
        members.splice(index, 1);
        updateMembersDOM();
    });

    room.on('data', (text, member) => {
        console.log(member, drone.clientId);
        if (member.id == drone.clientId) {
            addMessageToListDOM(text, member, "message-send");
        } else {
            addMessageToListDOM(text, member, "message-recv")
        }
    });
});

drone.on('close', event => {
    console.log('Connection was closed', event);
});

drone.on('error', error => {
    console.error(error);
});

function getRandomName() {
    const firstName = ["Marko", "Martin", "Bojan", "Boris", "Mateo", "Filip", "Kristijan", "Paolo", "Marin", "Luka", "Petar"];
    const lastName = ["Laska", "Buba", "Bole", "Pago", "Korda", "Leno", "Tole", "Maldini", "Maljo", "Kalu", "Pero"];
    return (
        firstName[Math.floor(Math.random() * firstName.length)] +
        " " +
        lastName[Math.floor(Math.random() * lastName.length)]
    );
}

function getRandomColor() {
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

const DOM = {
    membersCount: document.querySelector('.members-count'),
    membersList: document.querySelector('.members-list'),
    messages: document.querySelector('.messages'),
    input: document.querySelector('.message-form__input'),
    form: document.querySelector('.message-form'),
};

DOM.form.addEventListener('submit', sendMessage);



function sendMessage() {
    const value = DOM.input.value;
    if (value === '') {
        return;
    }
    DOM.input.value = '';
    drone.publish({
        room: 'observable-room',
        message: value,
    });
}

function createMemberElement(member) {
    const { name, color } = member.clientData;
    const el = document.createElement('div');
    el.appendChild(document.createTextNode(name));
    el.className = 'member';
    el.style.color = color;
    return el;
}


function updateMembersDOM() {
    DOM.membersCount.innerText = `${members.length === 1 ? "User in room:" : "Users in room:"} ${Number(members.length)}`;
    DOM.membersList.innerHTML = '';
    members.forEach(member =>
        DOM.membersList.appendChild(createMemberElement(member))
    );
}

function createMessageElement(text, member, className) {
    const el = document.createElement('div');
    el.appendChild(createMemberElement(member));
    el.appendChild(document.createTextNode(text));
    el.className = className;
    return el;
}

function addMessageToListDOM(text, member, className) {
    console.log("Address")
    const el = DOM.messages;
    const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight;
    el.appendChild(createMessageElement(text, member, className));
    if (wasTop) {
        el.scrollTop = el.scrollHeight - el.clientHeight;
    }
}


