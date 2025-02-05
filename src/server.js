import {pool, connectToDb} from './connection.js';
import express, { urlencoded } from 'express';
import inquirer from 'inquirer';
await connectToDb();
const PORT = process.env.PORT || 3001;
const app = express();

app.use(urlencoded({extended: false}));
app.use(express.json());
const start = () => {
    inquirer
    .prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'action',
            choices: [
                'View All Employees',
                'Add Employee',
                'Update Employee Role',
                'View All Roles',
                'Add Role',
                'View All Departments',
                'Add Department',
                'Quit'
            ]
        }
    ])
    .then((response) => {
        if (response.action === 'View All Employees') {
            pool.query('SELECT * FROM employee', (err, result) => {
                if(err) {
                    console.log(err);
                }
                else if(result){
                    console.log(result.rows);
                }
            })
        }
    });
}

start();

app.use((_req, res) => {
    res.status(404).end();
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});