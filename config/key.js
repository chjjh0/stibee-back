// 현재는 개발, 배포 모두 둘 다 mongoURI 같게 설정
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./prod');
} else {
  module.exports = require('./dev');
}
