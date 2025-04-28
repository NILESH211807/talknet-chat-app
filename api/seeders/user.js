const { faker } = require("@faker-js/faker");
const userModel = require("../models/user.model");

const createUserSignup = async (num) => {
    try {

        const usersPromise = [];

        for (let i = 0; i < num; i++) {
            usersPromise.push(userModel.create({
                name: faker.person.fullName(),
                username: `@${faker.person.firstName().toLowerCase()}`,
                email: faker.internet.email(),
                password: '123456',
            }));
        }

        await Promise.all(usersPromise);
        console.log('Users created successfully');
        process.exit(0)

    } catch (error) {
        console.log(error.message);
        process.exit(1)
    }
}


module.exports = {
    createUserSignup
}