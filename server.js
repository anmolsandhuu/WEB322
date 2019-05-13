/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
* assignment has been copied manually or electronically from any other source (including web sites) or
* distributed to other students. *
* Name: _Anmol Sandhu_ Student ID: _135051175_ Date: __24 March 2019__ *
* Online (Heroku) Link: https://salty-cove-38267.herokuapp.com
* ********************************************************************************/
const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const data_module = require("./data-service.js")
const path = require("path");
const exphbr = require("express-handlebars");
const app = express();
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
// Initializing 
const upload = multer({
    storage: storage
});

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.engine('.hbs', exphbr({
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    },
    defaultLayout: 'main'
}))

app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
})

app.set('view engine', 'hbs');


//routes

app.get("/", (req, res) => {
    res.render('home');
});

app.get("/about", (req, res) => {
    res.render('about');
});

//employess route
 
app.get("/employees", (req, res) => {
    if (req.query.status != undefined) {
        data_module.getEmployeesByStatus(req.query.status)
            .then((data) => {
                res.render("employees", {
                    employees: data
                })

            })
            .catch(() => {
                res.render({
                    message: "no results"
                });
            });
    } else if (req.query.department != undefined) {
        data_module.getEmployeesByDepartment(req.query.department)
            .then((data) => {
                if (data.length > 0)
                    res.render("employees", {
                        employees: data
                    });
                else
                    res.render("employees", {
                        employees: []
                    })
            })
            .catch(() => {
                res.render({
                    message: "no results"
                });
            });
    } else if (req.query.manager != undefined) {
        data_module.getEmployeesByManager(req.query.manager)
            .then((data) => {
                res.render("employees", {
                    employees: data
                })
            })
            .catch(() => {
                res.render({
                    message: "no results"
                });
            });
    } else if (req.originalUrl == "/employees") {
        data_module.getAllEmployees()
            .then((data) => {
                if (data.length > 0)
                    res.render("employees", {
                        employees: data
                    })
                else
                    res.render("employees", {
                        message: "no results"
                    });
            })
            .catch(() => {
                res.render({
                    message: "no results"
                });
            })
    } else {
        console.log("Not in case");
    }
})

app.get("/employees/add", (req, res) => {
    data_module.getDepartments()
        .then(function (data) {
            res.render('addEmployee', {
                departments: data
            });
        })
        .catch(function () {
            res.render("addEmployee", {
                departments: []
            });
        })
})

app.post('/employees/add', (req, res) => {
    data_module.addEmployee(req.body)
        .then(() => {
            res.redirect("/employees");
        })
        .catch(() => {
            res.send("unable to create employee");
        })
})

app.get("/employees/:empNum", (req, res) => {
    let viewData = {};

    data_module.getEmployeesByNum(req.params.empNum).then((data) => {
            if (data) {
                viewData.employee = data;
            } else {
                viewData.employee = null;
            }
        }).catch(() => {
            viewData.employee = null;
        }).then(data_module.getDepartments)
        .then((data) => {
            viewData.departments = data;

            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = [];
        }).then(() => {
            if (viewData.employee == null) {
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", {
                    viewData: viewData
                });
            }
        })

})

app.post("/employee/update", (req, res) => {
    data_module.updateEmployee(req.body)
        .then(() => {
            res.redirect("/employees");
        })
        .catch((data) => {
            console.log(data);
        })
});

app.get("/employees/delete/:empNum", (req, res) => {
    data_module.deleteEmployeeByNum(req.params.empNum)
        .then(() => {
            res.redirect("/employees");
        }).catch((data) => {
            res.status(500).send("Unable to Remove Employee / Employee not found");
        })
})

app.get("/departments", (req, res) => {
    data_module.getDepartments()
        .then((data) => {
            if (data.length > 0)
                res.render("departments", {
                    departments: data
                });
            else
                res.render("departments", {
                    message: "no results"
                });
        })
        .catch(() => {
            res.render({
                message: "no results"
            });
        })
});


//department route

app.get("/departments/add", (req, res) => {
    res.render('addDepartment', {
        title: "Add Department"
    });
})

app.post("/departments/add", (req, res) => {
    data_module.addDepartment(req.body)
        .then((data) => {
            res.redirect("/departments");
        })
        .catch(() => {
            res.send("unable to create employee");
        })
})

app.post("/departments/update", (req, res) => {
    data_module.updateDepartment(req.body)
        .then(() => {
            res.redirect("/departments");
        })
        .catch((err) => {
            console.log(err);
        })
})

app.get("/department/:departmentId", (req, res) => {
    data_module.getDepartmentById(req.params.departmentId)
        .then((data) => {
            if (data != null) {
                res.render("department", {
                    data: data
                });
            } else {
                res.status(404).send("Department Not Found");
            }
        })
        .catch(() => {
            res.status(404).send("Department Not Found");
        })
})

app.get("/department/delete/:departmentId", (req, res) => {
    data_module.deleteDepartmentById(req.params.departmentId)
        .then((data) => {
            res.redirect("/departments");
        })
        .catch(() => {
            res.status(500).send("Unable to Remove Department / Department not found");
        })
})


//images route

app.get("/images", (req, res) => {
    var path = './public/images/uploaded';
    var ary = [];

    fs.readdir(path, (err, files) => {
        for (var i = 0; i < files.length; i++) {
            ary.push(files[i]);
        }

        res.render("images", {
            image: ary
        });
    })
})


app.get("/images/add", (req, res) => {
    res.render('addImages');
})

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect('/images');
})


//404 route

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});


//server initializing and activation
function onStarthttp() {
    console.log("Express http server listening on : " + HTTP_PORT);
}
data_module.initialize()
    .then(function () {
        app.listen(HTTP_PORT, onStarthttp);
        
    })
    .catch(function () {
        console.log("Output the error to the console");
    })