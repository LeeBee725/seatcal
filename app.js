/******************************************************************
 *      준연동형 비례 대표제(Quasi-interlocking proportional)를     *
 *      연동형 캡(interlocking cap): 30석에 적용                    *
 *      나머지 17석은 병렬형 비례(parallel proportional) 적용        *
 *******************************************************************/

var parties = {
    partyName:  [],
    voteRate:   [],
    localSeats: [],
    QIPSeats:   [],
    PPSeats:    [],
    totalSeats: [],
    seatRatio: [],
    calTotalSeats: function() {
        var i = 0;
        while(i < this.partyName.length) {
            this.totalSeats[i] = this.localSeats[i] + this.QIPSeats[i] + this.PPSeats[i];
            this.seatRatio[i] = (this.totalSeats[i] / TOTAL_SEATS * 100).toFixed(2);
            i += 1;
        }
    }
}

$(document).ready(function(){
    var btn = document.getElementById("calBtn");

    Cal();
    btn.onclick = Cal;

    $(".voteRate").on("propertychange change paste input", function(){
        var voteRates = document.getElementsByClassName("voteRate");

        for(var i = 0; i < 10; i++) {
            parties.voteRate[i] = parseFloat(voteRates[i].value) || 0;
        }

        var sumOfRatio = 0;

        for(var i = 0; i < 10; i++) {
            sumOfRatio += parseFloat(voteRates[i].value) || 0;
        }

        document.getElementById('sumOfRatio').textContent = sumOfRatio.toFixed(2);
    })

    $(".localSeats").on("propertychange change paste input", function(){
        var localSeats = document.getElementsByClassName("localSeats");
        
        for(var i = 0; i < 10; i++) {
            parties.localSeats[i] = parseInt(localSeats[i].value) || 0;
        }

        var sumOfLocalSeats = 0;

        for(var i = 0; i < 10; i++) {
            sumOfLocalSeats += parseInt(localSeats[i].value) || 0;
        }

        document.getElementById('sumOfLocalSeats').textContent = sumOfLocalSeats;
    })
});

function Cal() {
    try {
        var partyNames = document.getElementsByClassName("partyName");
        var voteRates = document.getElementsByClassName("voteRate");
        var localSeats = document.getElementsByClassName("localSeats");
        var QIPSeats = document.getElementsByClassName("qip");
        var PPSeats = document.getElementsByClassName("pp");
        var totalSeats = document.getElementsByClassName("totalSeat");
        var seatRatio = document.getElementsByClassName("seatRatio");

        for(var i = 0; i < 10; i++) {
            parties.partyName[i] = partyNames[i].value;
            parties.voteRate[i] = parseFloat(voteRates[i].value) || 0;
            parties.localSeats[i] = parseInt(localSeats[i].value) || 0;
        }

        DivSeatWithVoteRatio(parties);

        for(var i = 0; i < 10; i++) {
            QIPSeats[i].textContent = parties.QIPSeats[i];
            PPSeats[i].textContent = parties.PPSeats[i];
            totalSeats[i].textContent = parties.totalSeats[i];
            seatRatio[i].textContent = parties.seatRatio[i];
        }

        var sumOfRatio = 0;
        var sumOfLocalSeats = 0;
        var sumOfQIP = 0;
        var sumOfPP = 0;
        var sumOfTotalSeat = 0;

        for(var i = 0; i < 10; i++) {
            sumOfRatio += parseFloat(voteRates[i].value) || 0;
            sumOfLocalSeats += parseInt(localSeats[i].value) || 0;
            sumOfQIP += parseInt(QIPSeats[i].textContent);
            sumOfPP += parseInt(PPSeats[i].textContent);
            sumOfTotalSeat += parseInt(totalSeats[i].textContent);
        }

        document.getElementById('sumOfRatio').textContent = sumOfRatio.toFixed(2);
        document.getElementById('sumOfLocalSeats').textContent = sumOfLocalSeats;
        document.getElementById('sumOfQIP').textContent = sumOfQIP;
        document.getElementById('sumOfPP').textContent = sumOfPP;
        document.getElementById('sumOfTotalSeat').textContent = sumOfTotalSeat;
    } catch(e) {
        alert(e.message);
    }
}

// 변수들 정리
const TOTAL_SEATS = 300;                    // 국회 의석수
const LIMIT_RATE = 100;
const LIMIT_LOCAL_SEAT = 253;               // 지역구 의석수 상한
const INTERLOCKING_CAP = 30;                // 연동형 캡
const PARALLEL_PROPORTIONAL_SEATS = 17;     // 병렬형 비례 의석수

// 준연동형 비례의석수(Quasi-interlocking proportional Seat; QIPSeatss) 계산 
// 환산의석(Converted Seats : 환산식을 통해 구한 의석 수 값)을 반올림 한다.
// divSeat    : 연동배분의석수 (의석 할당정당에 배분할 의석수)
// voteRate   : 득표율
// localSeats : 지역구 의석수
function CalConvertedSeats(divSeatsNum, voteRate, localSeats) {
    if(localSeats < 5 && voteRate < 3.00) { // 비의석할당정당
        return 0;
    }
    return (divSeatsNum * voteRate * 0.01 - localSeats) / 2
}
function DivQIPSeats(divSeatsNum, voteRate, localSeats) {
    // 산출시 소수점 첫째 자리에서 반올림 -> 산출결과가 1보다 작을경우 0으로 처리
    var result = Math.round(CalConvertedSeats(divSeatsNum, voteRate, localSeats));
    if(result < 1) {
        return 0;
    } else {
        return result;
    }
}

// 의석을 분배할때 정수로 분배한뒤 여석을 소수로 재분배
// datas       : 수식 결과 데이터를 담은 배열
// divSeatsNum : 채워야하는 의석 수
function divSeats(datas, divSeatsNum){
    // 분배되어 증가한 의석수를 담은 배열
    var distributed = datas.map(function(n){
        return 0;
    });

    // 잔여석 분배(정수의 의석)
    datas.forEach(function(n, i) {
        if(n < 0) {
            n = 0;
        }
        if(n > 0) {
            divSeatsNum -= Math.trunc(n);
            distributed[i] += Math.trunc(n);
        }
    });

    // 소수점 아래 부분 처리를 위해 배열 변환
    datas = datas.map(function(n) {
        return n - Math.trunc(n);
    }).map(function(n,i){
        if( n > 0 ) return {value: n, index: i};
        else return {value: 0, index: -1}
    }).sort(function(a,b) {
        return b['value'] - a['value'];
    }).map(function(n) {
        return n['index'];
    });

    // 잔여의석 분배 (소수 처리)
    i = 0
    while(divSeatsNum > 0) {
        if( datas[i] >= 0 ) {
            distributed[datas[i++]] += 1;
            divSeatsNum -= 1;
        } else {
            i = 0;
        }
    }

    return distributed
}

// 비의석할당 정당 구하는 함수
function NotIncludedParty(parties) {
    // 비의석할당 정당 수
    var sumOfLocalSeats = 0;

    // 지역구 의석수가 5석 미만이고 득표율이 3% 미만인 경우 포함
    parties.localSeats.forEach(function(n,i) {
        if(n < 5 && parties.voteRate[i] < 3.00) {
            sumOfLocalSeats += n;
        } else if(parties.voteRate[i] == 0) {
            sumOfLocalSeats += n;       // 무소속 정당 여기 포함
        }
    })

    return sumOfLocalSeats
}

// 계산 버튼 누를시 실행할 함수
// parties : 정당들의 정보를 담은 객체
function DivSeatWithVoteRatio(parties) {
    // 지역구 의석수 합산 + 비의석할당정당의 지역구 의석수 합산
    const sumOfLocalSeats = parties.localSeats.reduce(function(pre, current) {
        return pre + current
    });
    const sumOfNotIncluded = NotIncludedParty(parties);
    const sumOfVoteRate = parties.voteRate.reduce(function(pre, current) {
        return pre + current
    })
    
    if(sumOfVoteRate > LIMIT_RATE) {
        throw new Error('정당득표율의 합이 100%를 넘었습니다.');
    }

    if(sumOfLocalSeats != LIMIT_LOCAL_SEAT) {
        if(sumOfLocalSeats > LIMIT_LOCAL_SEAT ) {
            console.log('higher than LIMIT_LOCAL_SEAT(253).');
            throw new Error('지역구 의원수가 253보다 큽니다.');
        } else {
            console.log('lower than LIMIT_LOCAL_SEAT(253)')
            throw new Error('지역구 의원수가 253보다 작습니다.');
        }
    }
    
    console.log('success LIMIT_LOCAL_SEAT(253)')
    console.log(`sumOfNotIncluded: ${sumOfNotIncluded}`)

    

    // 1단계: 준연동형 비례 의석수 계산 
    const divSeatsNum = TOTAL_SEATS - sumOfNotIncluded;
    parties.QIPSeats = parties.voteRate.map(function(n){ return 0 }).map(function(n,i) {
        return DivQIPSeats(divSeatsNum, parties.voteRate[i], parties.localSeats[i]);
    })
    
    var sumOfQIPSeats = parties.QIPSeats.reduce(function(pre,current) {
        return pre + current
    });

    // DEBUG
    console.log();
    parties.QIPSeats.forEach(function(n,i){
        console.log(`QIPSeats[${i}]: ${n}`);
    })
    console.log(sumOfQIPSeats);

    // 2단계: 준연동형 비례 의석수 계산 -> 연동형 캡 30석 맞추기
    if(sumOfQIPSeats < INTERLOCKING_CAP) {
        // 30보다 작아 여석이 있는경우
        console.log()
        console.log('***********lower than 30***********')
        var leftSeats = INTERLOCKING_CAP - sumOfQIPSeats;
        console.log(leftSeats);
        
        var adjusted = parties.QIPSeats.map(function(n,i){
            return leftSeats * parties.voteRate[i] * 0.01;
        });

        var increase = divSeats(adjusted, leftSeats);
        
        // 배분된 의석수 적용
        parties.QIPSeats = parties.QIPSeats.map(function(n,i) {
            return n + increase[i];
        })
        
        // DEBUG
        parties.QIPSeats.forEach(function(n,i){
            console.log(`QIPSeats[${i}]: ${n}`);
        })
        
        sumOfQIPSeats = parties.QIPSeats.reduce(function(pre,current) {
            return pre + current
        });

        console.log(sumOfQIPSeats);

    } else if(sumOfQIPSeats > INTERLOCKING_CAP) {
        // 30보다 커서 30석에 맞춰 다시 구해야 하는 경우
        console.log()
        console.log('***********higher than 30***********')

        parties.QIPSeats = parties.QIPSeats.map(function(n,i) {
            var temp = INTERLOCKING_CAP *
                CalConvertedSeats(divSeatsNum, parties.voteRate[i], parties.localSeats[i]) / sumOfQIPSeats;
            
            return temp;
        })

        // 배분된 의석수 적용
        parties.QIPSeats = divSeats(parties.QIPSeats,INTERLOCKING_CAP);

        // DEBUG
        parties.QIPSeats.forEach(function(n,i){
            console.log(`QIPSeats[${i}]: ${n}`);
        })
        
        sumOfQIPSeats = parties.QIPSeats.reduce(function(pre,current) {
            return pre + current
        });

        console.log(sumOfQIPSeats);

    } else {
        // 30석인 경우
        console.log()
        console.log('***********exactly 30!***********')
    }

    // 3단계: 병렬형 17석 계산 
    parties.PPSeats = parties.voteRate.map(function(n,i){
        if(parties.localSeats[i] < 5 && parties.voteRate[i] < 3.00) { // 비의석할당정당
            return 0;
        }
        return PARALLEL_PROPORTIONAL_SEATS * parties.voteRate[i] * 0.01;
    });

    // 배분된 의석수 적용
    parties.PPSeats = divSeats(parties.PPSeats,PARALLEL_PROPORTIONAL_SEATS);

    // DEBUG
    parties.PPSeats.forEach(function(n,i){
        console.log(`PPSeats[${i}]: ${n}`);
    })

    parties.calTotalSeats();
    // 최종 객체 확인
    console.log(parties);
};
/*
var parties = {
    partyName:  ['party1', 'party2', 'party3', 'party4', 'party5', 'party6', 'party7', 'party8', 'party9', 'NoParty'],
    voteRate:   [20,20,20,20,20,0,0,0,0,0],
    localSeats: [70,60,54,50,19,0,0,0,0,0],
    QIPSeats:   [],
    PPSeats:    [],
    totalSeats: [],
    seatRatio: [],
    calTotalSeats: function() {
        var i = 0;
        while(i < this.partyName.length) {
            this.totalSeats[i] = this.localSeats[i] + this.QIPSeats[i] + this.PPSeats[i];
            this.seatRatio[i] = (this.totalSeats[i] / TOTAL_SEATS * 100).toFixed(2);
            i += 1;
        }
    }
}

DivSeatWithVoteRatio(parties);
*/
