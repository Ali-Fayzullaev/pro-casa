const bcrypt = require('bcryptjs');

const hash = '$2a$10$3Fha88RA5TkTRJ9mglnPB.URjwwksyKyrGLE4Gu6Ilc/LQG3yMOQy';
const password = 'admin123';

bcrypt.compare(password, hash).then(result => {
  console.log('Password matches:', result);
  if (!result) {
    console.log('Generating new hash for comparison:');
    return bcrypt.hash(password, 10);
  }
}).then(newHash => {
  if (newHash) {
    console.log('New hash:', newHash);
  }
});
