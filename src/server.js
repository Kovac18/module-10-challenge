import {pool, connectToDb} from './connection.js';
import express, { urlencoded } from 'express';
import inquirer from 'inquirer';
// import fs from 'fs';
await connectToDb();
const PORT = process.env.PORT || 3001;
const app = express();

app.use(urlencoded({extended: false}));
app.use(express.json());

// const sql = fs.readFileSync('schema.sql').toString();

// connection.query(sql, (error, results, fields) => {
//   if (error) throw error;
//   console.log(results);
// });

// connection.end();
// const sql2 = fs.readFileSync('seeds.sql').toString();

// connection.query(sql2, (error, results, fields) => {
//   if (error) throw error;
//   console.log(results);
// });

// connection.end();
// viewAllDepartments();

const init = () => {
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
            viewEmployees();
        } else if (response.action === 'Add Employee') {
            addEmployee();
        } else if (response.action === 'Update Employee Role') {
            updateEmployeeRole();
        } else if (response.action === 'View All Roles') {
            viewAllRoles();
        } else if (response.action === 'Add Role') {
            addRole();
        } else if (response.action === 'View All Departments') {
            viewAllDepartments();
        } else if (response.action === 'Add Department') {
            addDepartment();
        } else if (response.action === 'Quit') {
            console.log('Goodbye!');
            process.exit();
        } else {
            console.log('Please make a valid selection');
            init();
        }
    });
}

const viewEmployees = () => {
    pool.query('SELECT * FROM employee', (err, result) => {
        if(err) {
            console.log(err);
            process.exit();
        }
        else if(result){
            console.log(result.rows);
            init();
        }
    })
};

const addEmployee = () => {
    inquirer
    .prompt([
        {
            type: 'input',
            message: '',
            name: ''
        }
    ])
}

const updateEmployeeRole = () => {
    inquirer
    .prompt([
        {

        }
    ])
}

const viewAllRoles = () => {
    pool.query('SELECT * FROM role', (err, result) => {
        if(err) {
            console.log(err);
            process.exit();
        }
        else if(result){
            console.log(result.rows);
            init();
        }
    })
}

const addRole = () => {
    async function getDepartments()  {
        await client.connect();
        
        // Query to get department names
        const res = await client.query('SELECT id, name FROM department');
        
        // Map the results to an array of objects for Inquirer
        const departments = res.rows.map(department => ({
            name: department.name,
            value: department.id // Use the id as the value for Inquirer
        }));
    
    await client.end();
    return departments;
    }

    const departments = getDepartments();

    inquirer
    .prompt([
        {
            type: 'input',
            message: 'What is the role name?',
            name: 'role'
        },
        {
            type: 'input',
            message: 'What is the salary of the role?',
            name: 'salary',
        },
        {
            type: 'list',
            message: 'Which department does the role belong to?',
            choices: departments,
            name: 'department',
        }
    ])
    .then((answer) => {
        pool.query(`INSERT INTO role (${answer.role}, ${answer.salary}, ${answer.department.value})`, (err, result) => {
            if(err) {
                console.log(err);
                process.exit();
            }
            else if(result){
                console.log(`Added ${answer.role} to database`);
                init();
            }
        });
    });
}

const viewAllDepartments = () => {
    pool.query('SELECT * FROM department', (err, result) => {
        if(err) {
            console.log(err);
            process.exit();
        }
        else if(result){
            console.log(result.rows);
            init();
        }
    });
}

const addDepartment = () => {
    inquirer
    .prompt([
        {
            type: 'input',
            message: 'What is the department name?',
            name: 'department'
        }
    ])
    .then((answer) => {
        pool.query(`INSERT INTO department (${answer})`, (err, result) => {
            if(err) {
                console.log(err);
                process.exit();
            }
            else if(result){
                console.log(`Added ${answer} to database.`);
                init();
            }
        });
    });
}

init();

app.use((_req, res) => {
    res.status(404).end();
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});