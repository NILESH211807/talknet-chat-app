const { faker } = require("@faker-js/faker");
const chatModel = require("../models/chat.model");
const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");

const createSingleChats = async (chatsCount) => {
    try {

        const users = await userModel.find({}).select('_id').lean();

        const chatsPromise = [];

        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                chatsPromise.push(chatModel.create({
                    name: faker.lorem.words(1),
                    members: [users[i], users[j]]
                }));
            }
        }

        await Promise.all(chatsPromise);

        console.log('Chats seeded successfully');
        process.exit(0)

    } catch (error) {
        console.log(error.message);
        process.exit(1)
    }
}


const createGroupChats = async (chatsCount) => {
    try {

        const users = await userModel.find({}).select('_id').lean();

        const chatsPromise = [];

        for (let i = 0; i < chatsCount; i++) {
            const numMembers = faker.number.int({ min: 2, max: users.length });
            const members = [];

            for (let j = 0; j < numMembers; j++) {
                const randomIndex = Math.floor(Math.random() * users.length);
                const randomUser = users[randomIndex];

                // Check if the user is already in the members array
                if (!members.includes(randomUser)) {
                    members.push(randomUser);
                }
            }

            const chats = await chatModel.create({
                name: faker.lorem.words(1),
                isGroup: true,
                members: members,
                creator: members[0]
            });
            chatsPromise.push(chats);
        }

        await Promise.all(chatsPromise);
        console.log('Chats seeded successfully');
        process.exit(0)


    } catch (error) {
        console.log(error.message);
        process.exit(1)
    }
}

const createMessages = async (numMessages) => {
    try {

        const users = await userModel.find().select('_id');
        const chats = await chatModel.find().select('_id');

        const messagesPromise = [];

        for (let i = 0; i < numMessages; i++) {
            const randomUserIndex = Math.floor(Math.random() * users.length);
            const randomChatIndex = Math.floor(Math.random() * chats.length);

            messagesPromise.push(messageModel.create({
                sender: users[randomUserIndex],
                chat: chats[randomChatIndex],
                content: faker.lorem.sentence(),
            }));
        }

        await Promise.all(messagesPromise);
        console.log('Messages created successfully');
        process.exit(0)

    } catch (error) {
        console.log(error.message);
        process.exit(1)
    }
}

const createMessageInChat = async (chatId, numMessages) => {
    try {

        const users = await userModel.find().select('_id');
        const messagesPromise = [];

        for (let i = 0; i < numMessages; i++) {
            const randomUserIndex = Math.floor(Math.random() * users.length);

            messagesPromise.push(messageModel.create({
                sender: users[randomUserIndex],
                chat: chatId,
                content: faker.lorem.sentence(),
            }));
        }

        await Promise.all(messagesPromise);
        console.log('Messages created successfully');
        process.exit(0)

    } catch (error) {
        console.log(error.message);
        process.exit(1)
    }
}

module.exports = {
    createSingleChats, createGroupChats, createMessages, createMessageInChat,
}