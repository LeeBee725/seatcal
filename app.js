/******************************************************************
 *      �ؿ����� ��� ��ǥ��(Quasi-interlocking proportional)��     *
 *      ������ ĸ(interlocking cap): 30���� ����                    *
 *      ������ 17���� ������ ���(parallel proportional) ����        *
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

// ������ ����
const TOTAL_SEATS = 300;                    // ��ȸ �Ǽ���
const LIMIT_RATE = 100;
const LIMIT_LOCAL_SEAT = 253;               // ������ �Ǽ��� ����
const INTERLOCKING_CAP = 30;                // ������ ĸ
const PARALLEL_PROPORTIONAL_SEATS = 17;     // ������ ��� �Ǽ���

// �ؿ����� ����Ǽ���(Quasi-interlocking proportional Seat; QIPSeatss) ��� 
// ȯ���Ǽ�(Converted Seats : ȯ����� ���� ���� �Ǽ� �� ��)�� �ݿø� �Ѵ�.
// divSeat    : ��������Ǽ��� (�Ǽ� �Ҵ����翡 ����� �Ǽ���)
// voteRate   : ��ǥ��
// localSeats : ������ �Ǽ���
function CalConvertedSeats(divSeatsNum, voteRate, localSeats) {
    if(localSeats < 5 && voteRate < 3.00) { // ���Ǽ��Ҵ�����
        return 0;
    }
    return (divSeatsNum * voteRate * 0.01 - localSeats) / 2
}
function DivQIPSeats(divSeatsNum, voteRate, localSeats) {
    // ����� �Ҽ��� ù° �ڸ����� �ݿø� -> �������� 1���� ������� 0���� ó��
    var result = Math.round(CalConvertedSeats(divSeatsNum, voteRate, localSeats));
    if(result < 1) {
        return 0;
    } else {
        return result;
    }
}

// �Ǽ��� �й��Ҷ� ������ �й��ѵ� ������ �Ҽ��� ��й�
// datas       : ���� ��� �����͸� ���� �迭
// divSeatsNum : ä�����ϴ� �Ǽ� ��
function divSeats(datas, divSeatsNum){
    // �й�Ǿ� ������ �Ǽ����� ���� �迭
    var distributed = datas.map(function(n){
        return 0;
    });

    // �ܿ��� �й�(������ �Ǽ�)
    datas.forEach(function(n, i) {
        if(n < 0) {
            n = 0;
        }
        if(n > 0) {
            divSeatsNum -= Math.floor(n);
            distributed[i] += Math.floor(n);
        }
    });

    // �Ҽ��� �Ʒ� �κ� ó���� ���� �迭 ��ȯ
    datas = datas.map(function(n) {
        return n - Math.floor(n);
    }).map(function(n,i){
        if( n > 0 ) return {value: n, index: i};
        else return {value: 0, index: -1}
    }).sort(function(a,b) {
        return b['value'] - a['value'];
    }).map(function(n) {
        return n['index'];
    });

    // �ܿ��Ǽ� �й� (�Ҽ� ó��)
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

// ���Ǽ��Ҵ� ���� ���ϴ� �Լ�
function NotIncludedParty(parties) {
    // ���Ǽ��Ҵ� ���� ��
    var sumOfLocalSeats = 0;

    // ������ �Ǽ����� 5�� �̸��̰� ��ǥ���� 3% �̸��� ��� ����
    parties.localSeats.forEach(function(n,i) {
        if(n < 5 && parties.voteRate[i] < 3.00) {
            sumOfLocalSeats += n;
        } else if(parties.voteRate[i] == 0) {
            sumOfLocalSeats += n;       // ���Ҽ� ���� ���� ����
        }
    })

    return sumOfLocalSeats
}

// ��� ��ư ������ ������ �Լ�
// parties : ������� ������ ���� ��ü
function DivSeatWithVoteRatio(parties) {
    // ������ �Ǽ��� �ջ� + ���Ǽ��Ҵ������� ������ �Ǽ��� �ջ�
    const sumOfLocalSeats = parties.localSeats.reduce(function(pre, current) {
        return pre + current
    });
    const sumOfNotIncluded = NotIncludedParty(parties);
    const sumOfVoteRate = parties.voteRate.reduce(function(pre, current) {
        return pre + current
    })
    console.log(sumOfVoteRate)
    if(sumOfVoteRate - LIMIT_RATE > 0.01) {
        throw new Error('�����ǥ���� ���� 100%�� �Ѿ����ϴ�.');
    }
    
    if(sumOfLocalSeats != LIMIT_LOCAL_SEAT) {
        if(sumOfLocalSeats > LIMIT_LOCAL_SEAT ) {
            console.log('higher than LIMIT_LOCAL_SEAT(253).');
            throw new Error('������ �ǿ����� 253���� Ů�ϴ�.');
        } else {
            console.log('lower than LIMIT_LOCAL_SEAT(253)')
            throw new Error('������ �ǿ����� 253���� �۽��ϴ�.');
        }
    }
    
    console.log('success LIMIT_LOCAL_SEAT(253)');
    console.log('sumOfNotIncluded: ', sumOfNotIncluded);

    

    // 1�ܰ�: �ؿ����� ��� �Ǽ��� ��� 
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
        console.log('QIPSeats[', i, ']: ',n);
    })
    console.log(sumOfQIPSeats);

    // 2�ܰ�: �ؿ����� ��� �Ǽ��� ��� -> ������ ĸ 30�� ���߱�
    if(sumOfQIPSeats < INTERLOCKING_CAP) {
        // 30���� �۾� ������ �ִ°��
        console.log()
        console.log('***********lower than 30***********')
        var leftSeats = INTERLOCKING_CAP - sumOfQIPSeats;
        console.log(leftSeats);
        
        var adjusted = parties.QIPSeats.map(function(n,i){
            return leftSeats * parties.voteRate[i] * 0.01;
        });

        var increase = divSeats(adjusted, leftSeats);
        
        // ��е� �Ǽ��� ����
        parties.QIPSeats = parties.QIPSeats.map(function(n,i) {
            return n + increase[i];
        })
        
        // DEBUG
        parties.QIPSeats.forEach(function(n,i){
            console.log('QIPSeats[', i, ']: ',n);
        })
        
        sumOfQIPSeats = parties.QIPSeats.reduce(function(pre,current) {
            return pre + current
        });

        console.log(sumOfQIPSeats);

    } else if(sumOfQIPSeats > INTERLOCKING_CAP) {
        // 30���� Ŀ�� 30���� ���� �ٽ� ���ؾ� �ϴ� ���
        console.log()
        console.log('***********higher than 30***********')

        parties.QIPSeats = parties.QIPSeats.map(function(n,i) {
            var temp = INTERLOCKING_CAP *
                CalConvertedSeats(divSeatsNum, parties.voteRate[i], parties.localSeats[i]) / sumOfQIPSeats;
            
            return temp;
        })

        // ��е� �Ǽ��� ����
        parties.QIPSeats = divSeats(parties.QIPSeats,INTERLOCKING_CAP);

        // DEBUG
        parties.QIPSeats.forEach(function(n,i){
            console.log('QIPSeats[', i, ']: ',n);
        })
        
        sumOfQIPSeats = parties.QIPSeats.reduce(function(pre,current) {
            return pre + current
        });

        console.log(sumOfQIPSeats);

    } else {
        // 30���� ���
        console.log()
        console.log('***********exactly 30!***********')
    }

    // 3�ܰ�: ������ 17�� ��� 
    parties.PPSeats = parties.voteRate.map(function(n,i){
        if(parties.localSeats[i] < 5 && parties.voteRate[i] < 3.00) { // ���Ǽ��Ҵ�����
            return 0;
        }
        return PARALLEL_PROPORTIONAL_SEATS * parties.voteRate[i] * 0.01;
    });

    // ��е� �Ǽ��� ����
    parties.PPSeats = divSeats(parties.PPSeats,PARALLEL_PROPORTIONAL_SEATS);

    // DEBUG
    parties.PPSeats.forEach(function(n,i){
        console.log('PPSeats[', i, ']: ',n);
    })

    parties.calTotalSeats();
    // ���� ��ü Ȯ��
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