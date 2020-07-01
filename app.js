var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cookieParser = require("cookie-parser");
const {User} = require('./model/user');
const {auth} = require('./middleware/auth');
const {Team} = require('./model/team');
var uuidv4 = require("uuid/v4")
const config = require('./config/key')

mongoose.connect(config.mongoURI,{useNewUrlParser: true}).then(() => console.log("db connected"))
							.catch(err => console.error(err));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.set("view engine", "ejs")

app.get("/",function(req,res){
	res.render("landing");
})

app.get("/register", (req,res)=>{
	res.render("register");
})

app.get("/login", (req,res)=>{
	res.render("login");
})

app.get("/api/user/auth", auth, (req,res)=>{
	res.status(200).json({
		_id: req._id,
		isAuth: true,
		email: req.user.email,
		name: req.user.name,
		lastname: req.user.lastname,
		role: req.user.role
	})
})

app.post("/api/users/register", (req,res) =>{

	const user = new User(req.body)
	user.save((err, doc) =>{
		if(err) return res.json({success: false, err})
		res.redirect("/login")
		// res.status(200).json({
		// 	success: true,
		// 	userData: doc
		// });
	})
})

app.post("/api/users/login", (req,res)=>{
	//find the email
	console.log(req.body.email);
	User.findOne({email: req.body.email}, (err,user)=>{
		console.log(user);
		console.log(err);
		if(!user)
			return res.json({
				loginSuccess: false,
				message: "Auth failed, email not found"
			})
		//compare password
		user.comparePassword(req.body.password, (err, isMatch)=>{
			if(!isMatch){
				return;
				// return res.json({
				// 	loginSucess: false,
				// 	message: "Wrong password"
				// })
			}

		})

		//generate token
		user.generateToken((err,user)=>{
			if(err) return res.status(400).send(err);
			// res.render("cookie",{item:user.token})
			res.cookie("x_auth", user.token)
			.status(200)
			.json({
				"message": "You have successfully logged in. Please visit https://ancient-sea-94337.herokuapp.com/task route."
			})

		})
	})

})

app.get("/api/user/logout", auth, (req,res)=>{
	User.findOneAndUpdate({_id: req.user._id},{token:""},(err,doc)=>{
		if(err) return res.json({success: false, err})
		res.redirect("/login");
	})
})

app.get("/profile", auth, function(req,res){
	User.findOne({_id: req.user._id},function(err, user){
		if(err){
			console.log(err);
		}
		else
		{
			var name = user.name;
			var email = user.email;
			var tasks = user.tasks;
			var teams = user.teams;
			res.render("profile",{email:email, name:name, tasks:tasks, teams:teams})	
		}
	})
})

app.get("/task/new", auth,(req,res)=>{
	res.render("new");
})

app.get("/task",auth, function(req,res){

	User.findOne({_id: req.user._id},function(err, user){
		if(err){
			console.log(err);
		}
		else
		{
			var name = user.name;
			var tasks=user.tasks;
			res.render("task",{tasks:tasks, name:name})	
		}
	})
})

app.post("/task", auth, function(req,res){
	var name = req.body.name;
	var description = req.body.description;
	var pas = uuidv4();
	var newTask = {name:name, description:description, _id:pas}
	//create new blog and save to DB

	User.findOne({_id: req.user._id},function(err, user){
		if(err){
			console.log(err);
		}
		else
		{
			var tasks=user.tasks;
			tasks.push(newTask)
			User.findOneAndUpdate({_id: req.user._id},{tasks:tasks },(err,doc)=>{
			if(err) return res.json({success: false, err})
			res.redirect("/task")
			})
		}
	})
	
})

app.get("/task/delete/:id",auth, function(req,res){

	User.findOne({_id: req.user._id},function(err, user){
			if(err){
				console.log(err);
			}
			else
			{
				var tasks=user.tasks;
				for(var i=0;i<tasks.length;i++)
				{
					if(tasks[i]._id==req.params.id)
					{
						tasks.splice(i,1);
						i--;
					}
				}
				tasks.forEach(function(task)
				{
					if(task._id==req.params.id)
					{
						tasks.splice(task)
					}
				})
				User.findOneAndUpdate({_id: req.user._id},{tasks:tasks},(err,doc)=>{
				if(err) return res.json({success: false, err})
				res.redirect("/task")
				})
			}
		})
})

// app.get("/task/edit/:id",auth,function(req,res){
// 	res.render("edit",{id:req.params.id})
// })

// app.post("/task/edit/:id",auth,function(req,res){
// 	var subtask = req.body.subtask;
// 	var imagesrc = req.body.imgsrc;
// 	var newSubtask = {subtask:subtask, description:description, _id:pas}
// 	//create new blog and save to DB

// 	User.findOne({_id: req.user._id},function(err, user){
// 		if(err){
// 			console.log(err);
// 		}
// 		else
// 		{
// 			var tasks=user.tasks;
// 			tasks.push(newTask)
// 			User.findOneAndUpdate({_id: req.user._id},{tasks:tasks },(err,doc)=>{
// 			if(err) return res.json({success: false, err})
// 			res.redirect("/task")
// 			})
// 		}
// 	})
// })

app.get("/task/delete/:id",auth, function(req,res){

	User.findOne({_id: req.user._id},function(err, user){
			if(err){
				console.log(err);
			}
			else
			{
				var tasks=user.tasks;
				for(var i=0;i<tasks.length;i++)
				{
					if(tasks[i]._id==req.params.id)
					{
						tasks.splice(i,1);
						i--;
					}
				}
				tasks.forEach(function(task)
				{
					if(task._id==req.params.id)
					{
						tasks.splice(task)
					}
				})
				User.findOneAndUpdate({_id: req.user._id},{tasks:tasks},(err,doc)=>{
				if(err) return res.json({success: false, err})
				res.redirect("/task")
				})
			}
		})
})

app.get("/create",auth, (req,res)=>{
	res.render("newteam");
})

app.post("/create",auth, (req,res) =>{

	const team = new Team(req.body)
	team.save((err, doc) =>{
		if(err) return res.json({success: false, err})
		User.findOne({_id: req.user._id},function(err, user){
			if(err){
				console.log(err);
			}
			else
			{
				var name=user.name;
				var userteam = user.teams;
				userteam.push(team);
				var memebers=team.memebers;
				memebers.push(name);

				Team.findOneAndUpdate({_id:team._id},{memebers:memebers },(err,doc)=>{
				if(err) return res.json({success: false, err})
				User.findOneAndUpdate({_id: req.user._id},{teams: userteam},(err,doc)=>{
				if(err) return res.json({success: false, err})
				})
				res.redirect("/visit")
				})
			}
		})
	})
})

app.get("/visit",auth, (req,res)=>{
	User.findOne({_id: req.user._id},function(err, user){
		if(err){
			console.log(err);
		}
		else
		{
			var teams=user.teams;
			console.log(teams);
			res.render("visit",{teams:teams})	
		}
	})
})

app.get("/visit/:id",auth, function(req,res){
	Team.findById(req.params.id, function(err, foundTeam){
		if(err){
			res.redirect("/visit");
		}
		else
		{
			var name=foundTeam.name;
			var memebers=foundTeam.memebers;
			var tasks = foundTeam.tasks;
			res.render("show", {name: name, memebers:memebers, tasks:tasks, id:foundTeam._id});
		}
	})
})

app.get("/team/task/new",auth, (req,res)=>{
	res.render("newteamtask");
})

app.post("/team/task/new", auth, (req,res)=>{
	var teamname = req.body.teamname;
	var name = req.body.name;
	var description = req.body.description;
	var deadline = req.body.deadline;
	var doneby = req.body.doneby;
	var idd = uuidv4();
	var newTask = {name:name, description:description, deadline:deadline, doneby:doneby, _id:idd}
	//create new blog and save to DB

	Team.findOne({name: teamname},function(err, team){
		if(err){
			console.log(err);
		}
		else
		{
			var tasks=team.tasks;
			var id=team._id;
			tasks.push(newTask)
			Team.findOneAndUpdate({name:teamname},{tasks:tasks },(err,doc)=>{
			if(err) return res.json({success: false, err})
			res.redirect("/visit/"+id)
			})
		}
	})
})

app.get("/join", auth,(req,res)=>{

	Team.find({},function(err,allteams){
		if(err){
			console.log(err);
		}
		else
			res.render("join",{teams:allteams})	
	})
})

app.get("/team/join/:id",auth, function(req,res){
	res.render("entercode",{id:req.params.id})
})

app.post("/join/:id", auth, function(req,res){
	var code = req.body.access;
	if(code == req.params.id)
	{
		res.redirect("/join/"+req.params.id);
	}
	else
		res.redirect("team/join/"+req.params.id);
})

app.get("/join/:id",auth, function(req,res){
	Team.findById(req.params.id, function(err, team){
		if(err){
			res.redirect("/visit");
		}
		else
		{
			var id=team.id;
			User.findOne({_id: req.user._id},function(err, user){
				if(err){
					console.log(err);
				}
				else
				{
					var username=user.name;
					var userteam = user.teams;
					userteam.push(team);
					var memebers=team.memebers;
					memebers.push(username);
					
					Team.findOneAndUpdate({name:team.name},{memebers:memebers },(err,doc)=>{
					if(err) return res.json({success: false, err})
					})
					User.findOneAndUpdate({_id: req.user._id},{teams: userteam},(err,doc)=>{
					if(err) return res.json({success: false, err})
					})
					res.redirect("/visit/"+id);
				}
			})	
		}
	})
})

app.get("/add/:id", auth, function(req,res){
	res.render("add",{id: req.params.id})
})

app.post("/add/:id", auth, function(req,res){
	var email = req.body.email;
	Team.findOne({_id: req.params.id},function(err,teamFound)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			User.findOne({email:email}, function(err,user){
				var name = user.name;
				var userteams = user.teams
				userteams.push(teamFound);
				var memebers = teamFound.memebers;
				memebers.push(name);
				Team.findOneAndUpdate({_id:teamFound._id},{memebers:memebers },(err,doc)=>{
				if(err) return res.json({success: false, err}) })
				User.findOneAndUpdate({email:email},{teams: userteams},(err,doc)=>{
				if(err) return res.json({success: false, err})
				})
				res.redirect("/visit/"+req.params.id);

			})
			
		}
	})
})

app.listen(process.env.PORT || 3000, function(){
  console.log("server running on port 3000");
 });