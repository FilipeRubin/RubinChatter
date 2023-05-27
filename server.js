const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');

const hostname = '192.168.0.127';
const port = 30410;

const lastMessages = [
	{ id: 0, sender: "", message: "" },
	{ id: 0, sender: "", message: "" },
	{ id: 0, sender: "", message: "" },
	{ id: 0, sender: "", message: "" },
	{ id: 0, sender: "", message: "" },
	{ id: 0, sender: "", message: "" },
	{ id: 0, sender: "", message: "" },
	{ id: 0, sender: "", message: "" },
	{ id: 0, sender: "", message: "" },
	{ id: 0, sender: "", message: "" },
	{ id: 0, sender: "", message: "" },
	{ id: 0, sender: "", message: "" }
];

let lastId = 0;

const prepareResponse = (req, res) =>
{
	if (req.method == 'GET')
	{
		const parsedUrl = url.parse(req.url);
		const queryParams = querystring.parse(parsedUrl.query);
		
		if (queryParams.mId != null)
		{
			const responseArray = [];
			
			lastMessages.forEach((i) =>
			{
				if (parseInt(queryParams.mId) < i.id)
				{
					responseArray.push(i);
				}
			});
			
			if (lastMessages.length === 0)
			{
				res.statusCode = 204; // No content
				res.end();
			}
			else
			{
				responseArray.sort((a, b) => a.id - b.id);
				
				res.setHeader('Content-Type', 'application/json');
				res.statusCode = 200;
				res.end(JSON.stringify(responseArray));
			}
		}
		else if (req.url === '/') // If requesting the source HTML
		{
			res.setHeader('Content-Type', 'text/html');
			fs.readFile('index.html', (err, data) =>
			{
				if (err)
				{
					res.statusCode = 500;
					res.end('<h1>Internal Server Error (500)</h1>\n<p>It was not possible to retrieve the page\'s content because Rubin messed up somehow. Sorry for the inconvenience.\nPlease try again later.</p>');
				}
				else
				{
					res.statusCode = 200;
					res.end(data);
				}
			});
		}
		else if (req.url.endsWith('.html'))
		{
			res.setHeader('Content-Type', 'text/html');
			fs.readFile(req.url.slice(1), (err, data) => {
				if (err)
				{
					res.statusCode = 400;
					res.end(`<h1>Bad Request (400)</h1>\n<p>It was not possible to retrieve ${req.url}.</p>`);
				}
				else
				{
					res.statusCode = 200;
					res.end(data);
				}
			});
		}
		else if (req.url.endsWith('.js'))
		{
			res.setHeader('Content-Type', 'application/javascript');
			fs.readFile(req.url.slice(1), (err, data) => {
				if (err)
				{
					res.statusCode = 200;
					res.end('alert(\'It was not possible to load this page\\\'s JavaScript.\\nThings may not work as expected.\')');
				}
				else
				{
					res.statusCode = 200;
					res.end(data);
				}
			});
		}
		else if (req.url.endsWith('.css'))
		{
			res.setHeader('Content-Type', 'text/css');
			fs.readFile(req.url.slice(1), (err, data) => {
				if (err)
				{
					res.statusCode = 500;
					res.end();
				}
				else
				{
					res.statusCode = 200;
					res.end(data);
				}
			});
		}
		else if (req.url.endsWith('.ico'))
		{
			res.setHeader('Content-Type', 'image/x-icon');
			fs.readFile(req.url.slice(1), (err, data) => {
				if (err)
				{
					res.statusCode = 500;
					res.end();
				}
				else
				{
					res.statusCode = 200;
					res.end(data);
				}
			});
		}
		else
		{
			res.setHeader('Content-Type', 'text/plain');
			res.statusCode = 400;
			res.end(`Bad Request (400)\nWhat kind of information are you looking for? There's no ${req.url} in here...`);
		}
	}
	else if (req.method == 'POST')
	{
		let body = '';
		
		req.on('data', (chunk) =>
		{
			body += chunk;
		});
		
		req.on('end', () => 
		{
			const bodyJson = JSON.parse(body);
			let oldestMessageIndex = 0;
			let oldestMessageId = lastMessages[0].id;
			
			for (let i = 1; i < lastMessages.length; i++)
			{
				if (lastMessages[i].id < oldestMessageId)
				{
					oldestMessageIndex = i;
				}
			}
			
			lastId++;
			lastMessages[oldestMessageIndex].message = bodyJson.message;
			lastMessages[oldestMessageIndex].sender = bodyJson.sender;
			lastMessages[oldestMessageIndex].id = lastId;
			
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text-plain');
			res.end(lastId.toString());
		});
	}
}

const server = http.createServer(prepareResponse);

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
})