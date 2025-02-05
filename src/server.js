import {pool, connectToDb} from './connection.js';
import express, { urlencoded } from 'express';
import inquirer from 'inquirer';
await connectToDb();
const PORT = process.env.PORT || 3001;
const app = express();

app.use(urlencoded({extended: false}));
app.use(express.json());

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
}//done

const viewEmployees = () => {
    const query = `
    SELECT
    employee.id AS id,
    employee.first_name AS first_name,
    employee.last_name AS last_name,
    role.title AS title, 
    department.name AS department, 
    role.salary,
    manager.first_name || ' ' || manager.last_name AS manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee AS manager ON employee.manager_id = manager.id;
    `;
    pool.query(query, (err, result) => {
        if(err) {
            console.log(err);
            process.exit();
        }
        else if(result){
            console.table(result.rows);
            init();
        }
    })
}//done

const addEmployee = () => {
    inquirer
    .prompt([
        {
            type: 'input',
            message: "What is the employee's first name?",
            name: 'first'
        },
        {
            type: 'input',
            message: "What is the employee's last name?",
            name: 'last'
        },
        {
            type: 'list',
            message: "What is the employee's role?",
            name: 'role',
            choices: [],
        },
        {
            type: 'list',
            message: "Who is the employee's manager?",
            name: 'manager',
            choices: [],
        }
    ])
    .then((answer) => {
        const query = `
            INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4);
        `;
        pool.query(query, [answer.first, answer.last, answer.role, answer.manager],  (err, result) => {
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

const updateEmployeeRole = () => {
    inquirer
    .prompt([
        {
            type: 'list',
            message: "Which employee's role would you like to update?",
            name: 'employeeChoosen',
            choices: [],
        },
        {
            type: 'list',
            message: "What is the employee's new role?",
            name: 'newRole',
            choices: [],
        }
    ])
    .then((answer) => {
        const query = `
            UPDATE employee
            SET role_id = ($1)
            WHERE id = ($2);
        `;
        pool.query(query, [answer.newRole, answer.employeeChoosen], (err, result) => {
            if(err) {
                console.log(err);
                process.exit();
            }
            else if(result){
                console.log(`Updated employee's role.`);
                init();
            }
        });
    });
}

const viewAllRoles = () => {
    const query = `
        SELECT
        role.id AS id,
        role.title AS title,
        department.name AS department,
        role.salary AS salary
        FROM role
        JOIN department ON role.department_id = department.id
    `;
    pool.query(query, (err, result) => {
        if(err) {
            console.log(err);
            process.exit();
        }
        else if(result){
            console.table(result.rows);
            init();
        }
    })
}//done

const addRole = () => {
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
            choices: [],
            name: 'department',
        }
    ])
    .then((answer) => {
        const query = `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3);`
        pool.query(query, [answer.role, answer.salary, answer.department], (err, result) => {
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
    pool.query('SELECT * FROM department ', (err, result) => {
        if(err) {
            console.log(err);
            process.exit();
        }
        else if(result){
            console.table(result.rows);
            init();
        }
    });
}//done

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
        pool.query('INSERT INTO department (name) VALUES ($1);', [answer.department], (err, result) => {
            if(err) {
                console.log(err);
                process.exit();
            }
            else if(result){
                console.log(`Added ${answer.department} to database.`);
                init();
            }
        });
    });
}//done

init();

app.use((_req, res) => {
    res.status(404).end();
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});