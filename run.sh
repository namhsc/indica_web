## dừng container nếu đang chạy và xóa container cũ và xóa image cũ
docker stop indica-web || true 
docker rm -f indica-web || true    

## pull github repo
git checkout addapi
git pull origin addapi

## build docker image
docker build -t indica-web .

## run docker image
docker run -d -p 4568:80 --name indica-web indica-web
