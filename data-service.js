var fs = require("fs");
const Sequelize = require("sequelize");

// Sequelize intialiazation 
var sequelize = new Sequelize('d4h5cj9l9mfutd', 'cijyukoxwnxntm', '84526baf387c343c4547a6bcfac0f549f1e7116605b9ee887b448aa420daeb7c', {
    host: 'ec2-184-73-216-48.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    martialStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
}, {
    createdAt: false,
    updatedAt: false
});


var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
}, {
    createdAt: false,
    updatedAt: false
});




Department.hasMany(Employee, {
    foreignKey: 'department'
});

function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(Employee => resolve())
            .then(Department => resolve())
            .catch(function (err) {
                console.log("unable to sync the database");
            })
    })
}



function getAllEmployees() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                Employee.findAll()
                    .then(function (data) {
                        resolve(data);
                    }).catch(function () {
                        reject("no results returned");
                    })
            })
            .catch((err) => {
                reject("Unable to sync the database");
            })
    });
}

function addEmployee(employeeData) {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;

        for (const prop in employeeData) {
            if (employeeData[prop] == "") {
                employeeData[prop] = null;
            }
        }

        Employee.create({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            martialStatus: employeeData.martialStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate
        }).then(function (data) {
            resolve(data);
        }).catch(function () {
            reject("unable to create employee");
        })
    })
}

function getEmployeesByNum(num) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {
                employeeNum: num
            }
        }).then((data) => {
            resolve(data[0]);
        }).catch(() => {
            reject("no results returned");
        })
    })
}

function updateEmployee(employeeData) {

    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;

        for (const prop in employeeData) {
            if (employeeData[prop] == "") {
                employeeData[prop] = null;
            }
        }

        Employee.update(employeeData, {
            where: {
                employeeNum: employeeData.employeeNum
            }
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject("Fail to update data");
        })
    })
}


function getDepartments() {
    return new Promise((resolve, reject) => {
        Department.findAll()
            .then(function (data) {
                resolve(data);
            }).catch(function () {
                reject("no results returned")
            })
    })

}

function addDepartment(departmentData) {
    return new Promise((resolve, reject) => {
        for (const prop in departmentData) {
            if (departmentData[prop] == "") {
                departmentData[prop] = null;
            }
        }

        sequelize.sync().then(function () {
            Department.create({
                departmentName: departmentData.departmentName
            })
        }).then(function (data) {
            resolve(data);
        }).catch(function () {
            reject("unable to create department");
        })
    })
}

function updateDepartment(departmentData) {
    return new Promise((resolve, reject) => {
        for (const prop in departmentData) {
            if (departmentData[prop] == "") {
                departmentData[prop] = null;
            }
        }

        sequelize.sync().then(() => {
            Department.update(departmentData, {
                where: {
                    departmentId: departmentData.departmentId
                }
            }).then(() => {
                resolve(Department.update({
                    departmentName: departmentData.departmentNamd
                }, {
                    where: {
                        departmentId: departmentData.departmentId
                    }
                }))
            }).catch(() => {
                reject("unable to update department");
            })
        })

    })
}

function getDepartmentById(id) {
    return new Promise((resolve, reject) => {
        Department.findAll({
            where: {
                departmentId: id
            }
        }).then(function (data) {
            resolve(data[0]);
        }).catch(function () {
            reject("no results returned");
        })
    })
}

function deleteDepartmentById(id) {
    return new Promise((resolve, reject) => {
        Department.destroy({
                where: {
                    departmentId: id
                }
            })
            .then(function () {
                resolve();
            }).catch(function () {
                reject("Reject")
            })
    })
}

function deleteEmployeeByNum(empNum) {
    return new Promise((resolve, reject) => {
        Employee.destroy({
            where: {
                employeeNum: empNum
            }
        }).then(() => {
            resolve();
        }).catch(() => {
            reject("Fail to delete");
        })
    })
}

function getEmployeeByStatus(status) {

    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                Employee.findAll({
                        where: {
                            status: status
                        }
                    })
                    .then(function (data) {
                        resolve(data);
                    }).catch(function () {
                        reject("no results returned")
                    })
            })
            .catch((err) => {
                reject("Unable to sync data");
            })
    })

}

function getEmployeesByDepartment(department) {

    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Employee.findAll({
                where: {
                    department: department
                }
            }).then((data) => {
                resolve(data);
            }).catch((err) => {
                reject("no results returned");
            })
        })
    })
}

function getEmployeesByManager(manager) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Employee.findAll({
                where: {
                    employeeManagerNum: manager
                }
            }).then((data) => {
                resolve(data);
            }).catch((err) => {
                reject("No results returned");
            })
        }).catch((err) => {
            reject("Unable to sync data");
        })
    })
}

// Exporting All the functions 

module.exports = {
    initialize: initialize,
    getAllEmployees: getAllEmployees,
    getDepartments: getDepartments,
    addEmployee: addEmployee,
    getEmployeesByStatus: getEmployeeByStatus,
    getEmployeesByDepartment: getEmployeesByDepartment,
    getEmployeesByManager: getEmployeesByManager,
    getEmployeesByNum: getEmployeesByNum,
    updateEmployee: updateEmployee,
    addDepartment: addDepartment,
    updateDepartment: updateDepartment,
    getDepartmentById: getDepartmentById,
    deleteDepartmentById: deleteDepartmentById,
    deleteEmployeeByNum: deleteEmployeeByNum

};