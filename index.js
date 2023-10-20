require('dotenv').config()
const express = require('express');
const app = express()
const TelegramBot = require("node-telegram-bot-api");
const token = process.env.DB_URL
const port = process.env.DB_PORT || 2022
const bot = new TelegramBot(token, { polling: true });
const axios = require('axios');
const fs = require('fs')
app.use(express.json())
app.use(express.urlencoded())
var main_controller = []
var post_data = {}



app.get('/', (req, res) => {
	res.send({ "Success": "Welcome! welcome ............Home page" });
})


const init = async (bot) => {
	var searchFIO='';
	// starting bot
	bot.on('voice',  async (msg) => {
		console.log(msg.voice);
		const stream = bot.getFileStream(msg.voice.file_id);
		const chunks = [];
		stream.on('data', chunk => chunks.push(chunk));
		stream.on('end', () => {
			const axiosConfig = {
				metod: 'POST',
				url: 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize',
				headers: {
					Authorization: 'Api-Key ' + process.env.YA_API_KEY
				},
				data: Buffer.concat(chunks)
			};
			axios(axiosConfig).then(response => {
				const command = response.data.result;
				console.log(response.data);
				var name = command
				bot.sendMessage(msg.chat.id, name)
				var data = fs.readFileSync("./data/data.json", "utf-8")
				data = JSON.parse(data)
		
				search_list = ` `

				for (let i of data) {
					console.log(`${name}   `); console.log(`${i.name}   `);
					if (!!name) {
		
						var count = 0;
						if (i.name.toLowerCase().includes(name.toLowerCase())) {
							count++;
							search_list = `\n\nФИО: ${i.name}\nдолжность: ${i.jobtitle}\nтелефон:: ${i.mobile}\nкаб.: ${i.room}\nэл.почта: ${i.email}`
							bot.sendMessage(msg.chat.id, search_list);
		
						}
					}
					
				}
/* 				if (count == 0) { bot.sendMessage(msg.chat.id, `Записей не найдено!`); count++  } */
				
			}).catch((err) => {
				console.log('Ошибка распознавания речи', err);
			})
		})


	})

	bot.on('message', async (msg) => {
		// for adding number
		var message = msg.text
		var name = message
		var data = fs.readFileSync("./data/data.json", "utf-8")
		data = JSON.parse(data)

		search_list = ` `

		for (let i of data) {
			console.log(`${name}   `); console.log(`${i.name}   `);
			if (!!name) {

				var count = 0;
				if (i.name.toLowerCase().includes(name.toLowerCase())) {
					count++;
					search_list = `\n\nФИО: ${i.name}\nдолжность: ${i.jobtitle}\nтелефон:: ${i.mobile}\nкаб.: ${i.room}\nэл.почта: ${i.email}`
					bot.sendMessage(msg.chat.id, search_list);

				}
			}
			
		}
/* 		if (count == 0) { bot.sendMessage(msg.chat.id, `Записей не найдено!`) } */
		/* 			bot.sendMessage(msg.chat.id, search_list); */
	}
	)
}
app.listen(port, async () => {
	console.log(`Server is running on ${port}`)
	await init(bot)
})




