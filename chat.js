let lastMessageId = 0;

window.addEventListener("load", function(){ main(); });

let messageIntervalId;

let userName;

function main()
{
	getMessages();
	userName = window.prompt('Enter your name:');
	if (userName === '')
		userName = 'Person';
	else if (userName.length > 10)
	{
		userName = userName.substring(0, 10);
	}
	messageInvervalId = setInterval(getMessages, 250);
}

function sendMessage()
{
	let userMessage = document.getElementById('userbox-input').value;
	if (userMessage === '')
		return;
	document.getElementById('userbox-input').value = '';
	
	fetch(window.location.href, {
		method: 'POST',
		headers: {'Content-Type': 'text/plain'},
		body: JSON.stringify({sender: userName, message: userMessage})
	}).then(response =>
	{
		if (response.ok)
		{
			return response.text();
		}
		else
		{
			throw new Error('Request failed with status ' + response.status);
		}
	}).then(data =>
	{
		const newId = parseInt(data);
		lastMessageId = newId;
		addMessage({sender: userName, message: userMessage})
	}).catch(error =>
	{
		console.error(error);
	});
}

function handleKeyDown(event)
{
	if (event.key === 'Enter')
	{
		event.preventDefault();
		sendMessage();
	}
}

function getMessages()
{
	fetch(window.location.href + '?mId=' + lastMessageId, {
		method: 'GET'
	}).then(response => {
		if (response.ok)
		{
			return response.json();
		}
		else
		{
			throw new Error('Request failed with status ' + response.status);
		}
	}).then(data => {
		data.forEach((i) =>
		{
			addMessage(i);
			if (i.id > lastMessageId)
			{
				lastMessageId = i.id;
			}
		});
	}).catch(error => {
		console.error(error);
		clearInterval(messageIntervalId);
	});
}

function addMessage(message)
{
	const chatlogContainer = document.getElementById("chatlog");

	const messageElement = document.createElement("div");
	messageElement.classList.add('chatmessage');
	messageElement.innerHTML = `<strong>${message.sender}:</strong> ${message.message}`;
	chatlogContainer.appendChild(messageElement);
}