import { getRandomInt } from './';

export default function(percents) {
  let randomNumber = getRandomInt(100);
  let sum = 0;
  let cnt = -1;

  do {
  	cnt++;
  	sum += percents[cnt];
  } while(sum < randomNumber);

  return cnt;
}