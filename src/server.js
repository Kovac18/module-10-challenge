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
// function for addEmployee
const getEmployees2 = async () => {
    const result = await pool.query(`SELECT employee.first_name || ' ' || employee.last_name AS name FROM employee`);
    return [...result.rows.map(row => row.name), 'Null'];
}

const addEmployee = async () => {
    const role = await getRoles();
    const employ = await getEmployees2();
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
            choices: role,
        },
        {
            type: 'list',
            message: "Who is the employee's manager?",
            name: 'manager',
            choices: employ,
        }
    ])
    .then( async (answer) => {
        const query = `
            INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4);
        `;
        const roleId = await getRoleIdByName(answer.role);
        const managerId = answer.manager === 'Null' ? null: await getEployeeIdByName(answer.manager);
        pool.query(query, [answer.first, answer.last, roleId, managerId],  (err, result) => {
            if(err) {
                console.log(err);
                process.exit();
            }
            else if(result){
                console.log(`Added ${answer.first} ${answer.last} to database`);
                init();
            }
        });
    });
}//done
// functions for updateEmployeeRole
const getEmployees = async () => {
    const result = await pool.query(`SELECT employee.first_name || ' ' || employee.last_name AS name FROM employee`);
    return result.rows.map(row => row.name);
}
// also used in addEmployee
const getRoles = async () => {
    const result = await pool.query('SELECT role.title FROM role');
    return result.rows.map(row => row.title);
}

const getEployeeIdByName = async (employeeName) => {
    const result = await pool.query(`SELECT id FROM employee WHERE employee.first_name || ' ' || employee.last_name = $1`, [employeeName]);
    return result.rows[0].id;
}

const getRoleIdByName = async (roleName) => {
    const result = await pool.query('SELECT id FROM role WHERE title = $1', [roleName]);
    return result.rows[0].id;
}

const updateEmployeeRole = async () => {
    const employ = await getEmployees();
    const role = await getRoles();
    inquirer
    .prompt([
        {
            type: 'list',
            message: "Which employee's role would you like to update?",
            name: 'employeeChoosen',
            choices: employ,
        },
        {
            type: 'list',
            message: "What is the employee's new role?",
            name: 'newRole',
            choices: role,
        }
    ])
    .then( async (answer) => {
        const query = `
            UPDATE employee
            SET role_id = ($1)
            WHERE id = ($2);
        `;
        const employeeId = await getEployeeIdByName(answer.employeeChoosen);
        const roleId = await getRoleIdByName(answer.newRole);
        pool.query(query, [roleId, employeeId], (err, result) => {
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
}//done

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
// functions for addRole
const getDepartments = async () => {
    const result = await pool.query('SELECT department.name FROM department');
    return result.rows.map(row => row.name);
}

const getDepartmentIdByName = async (departmentName) => {
    const result = await pool.query('SELECT id FROM department WHERE name = $1', [departmentName]);
    return result.rows[0].id;
}

const addRole = async () => {
    const depo = await getDepartments();
    inquirer
    .prompt([
        {
            type: 'input',
            message: 'What is the role name?',
            name: 'role'
        },
        {
            type: 'integer',
            message: 'What is the salary of the role?',
            name: 'salary',
        },
        {
            type: 'list',
            message: 'Which department does the role belong to?',
            choices: depo,
            name: 'department',
        }
    ])
    .then( async (answer) => {
        const query = `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3);`
        const depoId = await getDepartmentIdByName(answer.department);
        pool.query(query, [answer.role, answer.salary, depoId], (err, result) => {
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
}//done

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