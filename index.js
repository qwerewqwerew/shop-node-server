const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const multer = require("multer");
const upload = multer({
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, "uploads");
		},
		filename: function (req, file, cb) {
			cb(null, file.originalname)
		},
	}),
});
/* const port = process.env.PORT || 8080; */
const port = 8080;

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.get("/products", function (req, res) {
	models.Product.findAll({
		order: [["createdAt", "DESC"]],
		attributes: ["id", "name", "price", "seller", "imageUrl", "createdAt"],
	})
		.then((result) => {
			res.send({
				product: result,
			});
		})
		.catch((err) => {
			console.error(err);
			res.send("에러발생");
		});
});

app.get("/products/:id", function (req, res) {
	const params = req.params;
	const { id } = params;
	models.Product.findOne({
		where: {
			id,
		},
	})
		.then((result) => {
			res.send({ product: result });
		})
		.catch((err) => {
			console.error(err);
			res.status(400).send("상품조회시 에러가 발생했습니다");
		});
});

app.post("/products", function (req, res) {
	const body = req.body;
	const { name, description, price, seller, imageUrl } = body;
	if (!name || !description || !price || !seller) {
		res.send("모든 필드를 입력해주세요");
	}
	models.Product.create({
		name,
		description,
		price,
		seller,
		imageUrl 
	})
		.then((result) => {
			/* console.log("상품생성결과:", result); */
			res.send({
				product: result,
			});
		})
		.catch((err) => {
			console.error(err);
			res.status(400).send("상품 업로드에 문제가 발생했습니다.");
		});
});

app.post("/image", upload.single("image"), (req, res) => {
	const file = req.file;
	res.send({
		imageUrl: file.path,
	});
});

app.listen(port, () => {
	console.log("망고샵 서버 실행중");
	models.sequelize
		.sync()
		.then(() => {
			console.log("DB 연결 성공");
		})
		.catch((err) => {
			console.log("DB 연결 실패");
			console.error(err);
			process.exit();
		});
});