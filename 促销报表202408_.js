// '.tbl-content' consumed little space for vertical scrollbar, scrollbar width depend on browser/os/platfrom. Here calculate the scollbar width .

'use strict'
$(window).on("load resize", function() {
  var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
  $('.tbl-header').css({'padding-right':scrollWidth});
}).resize();


function populateTable(_tableTitle, _headers, _reportList) {
    const tableTitle = document.getElementById('tableTitle');
    const tableHeader = document.querySelector('thead');
    const tableBody = document.querySelector('tbody');

    // 清空表格内容
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
	tableTitle.innerHTML = _tableTitle;
    // 生成表格标题行
    const headerRow = document.createElement('tr');
    _headers.forEach((headerText, index) => {
        const headerCell = document.createElement('th');

		
		if (headerText == 'MergeCells') {

		} else {
			let a = extractParts(headerText)
			headerCell.innerHTML = a[2];

			// 加合并单元
			if (a[0] > 1) {
				headerCell.setAttribute('rowspan', a[0])
			}
			if (a[1] > 1) {
				headerCell.setAttribute('colspan', a[1])
			}

			//headerCell.textContent = headerText;
			// 如果是前两列，则添加最小宽度类
			if (index == 0) {
				headerCell.classList.add('col1');
			} else if (index == 1) {
				headerCell.classList.add('col2');
			} else {
				headerCell.classList.add('col3');
			}
			headerRow.appendChild(headerCell);
		}
    });
    tableHeader.appendChild(headerRow);
	
    // 遍历数据并生成表格行
    _reportList.forEach((person, index1) => {
        const row = document.createElement('tr');
		
        // 遍历每个人员的属性，动态生成对应的单元格
        Object.values(person).forEach((value, index) => {
            const cell = document.createElement('td');

			if (value == 'MergeCells') {

			} else {
				let a = extractParts(value)
				//cell.textContent = value;
				cell.innerHTML = a[2];
				// 加合并单元
				if (a[0] > 1) {
					cell.setAttribute('rowspan', a[0])
				}
				if (a[1] > 1) {
					cell.setAttribute('colspan', a[1])
				}

				// 加样式
				if (index == 0) {
					cell.classList.add('col1');
				} else if (index === 1) {
					cell.classList.add('col2');
				} else {
					cell.classList.add('col3');
				}
				row.appendChild(cell);
			}
        });

        // 将行添加到表格主体中
        tableBody.appendChild(row);
    });
}

function extractParts(str) {
    // 检查字符串是否以 "Merge_" 开头
    if (String(str).startsWith('Merge_')) {
        // 去掉前缀 "Merge_" 并获取剩余部分
        const remainingPart = str.substring(6);
        
        // 使用下划线分割剩余部分，最多分割两次
        const parts = remainingPart.split('_');
        
        // 检查分割后的数组长度
        if (parts.length >= 3) {
            return [
                Number(parts[0]),
                Number(parts[1]),
                parts.slice(2).join('_') // 将第3部分及以后部分重新组合
            ];
        } else {
            // 如果分割后的数组长度不符合预期
            return [1,1,str];
        }
    } else {
        // 如果字符串不以 "Merge_" 开头
        return [1,1,str];
    }
}
async function fetchSequentially(userid, token1, token2, token3) {
	try {
		// 第一次请求
		const reportToken = await fetchReportToken(userid, token1, token2, token3);
		// 第二次请求（使用第一次请求的结果）
		const reportList = await fetchReportList(token1, token2, reportToken);
		// 返回第二次请求的结果
		return reportList;
	} catch (error) {
		console.error('Error during sequential fetch:', error);
		throw error; // 继续抛出错误，让调用者处理
	}
}

async function fetchReportToken(userid, token1, token2, token3) {
	const url = `https://7t8qdiya.lc-cn-n1-shared.com/1.1/classes/auth/${userid}`;
	const options = {
		method: 'GET',
		headers: {
			'X-LC-Id': token1,
			'X-LC-Key': token2,
			'X-LC-Session': token3,
			'Content-Type': 'application/json'
		}
	};

	try {
		const response = await fetch(url, options);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const jsonData = await response.json();
		console.log('Response Data:', jsonData);
		const userToken = jsonData.userToken;
		if (!userToken) {
			throw new Error('User token not found');
		}
		// 返回userToken给调用者
		return userToken;
	} catch (error) {
		console.error('Error fetching data:', error.message);
		throw error; // 继续抛出错误，让调用者处理
	}
}

async function fetchReportList(token1, token2, reportToken) {
	const url = 'https://7t8qdiya.lc-cn-n1-shared.com/1.1/classes/cuxiaobb?order=-createdAt&limit=1';
	const options = {
		method: 'GET',
		headers: {
			'X-LC-Id': token1,
			'X-LC-Key': token2,
			'X-LC-Session': reportToken,
			'Content-Type': 'application/json'
		}
	};

	try {
		const response = await fetch(url, options);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const jsonData = await response.json();
		console.log('Response Data:', jsonData);
		const results = jsonData.results;
		if (!results) {
			throw new Error('Results not found');
		}
		// 返回results数组给调用者
		return results;
	} catch (error) {
		console.error('Error fetching data:', error.message);
		throw error; // 继续抛出错误，让调用者处理
	}
}




document.addEventListener('DOMContentLoaded', function() {

    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var paramValue = urlParams.get('token');

	
	try {
		// 获取当前页面的URL
		var url = window.location.href;
		
		// 找到参数部分
		var queryString = url.split('?')[1];
		if (!queryString) {
			throw new Error('No parameters found in the URL.');
		}
		
		// 解析参数为对象
		var params = new URLSearchParams(queryString);
		var tokenParam = params.get('token');
		
		if (!tokenParam) {
			throw new Error('Token parameter is missing.');
		}
		
		// 按逗号分割token
		var tokens = tokenParam.split(',');
		
		// 检查分割结果
		if (tokens.length !== 4) {
			throw new Error('Expected exactly 4 tokens separated by commas.');
		}
		
		// 输出结果
		var userid = tokens[0].trim();
		var token1 = tokens[1].trim();
		var token2 = tokens[2].trim();
		var token3 = tokens[3].trim();
		
		console.log('userid 0:', userid);
		console.log('Token 1:', token1);
		console.log('Token 2:', token2);
		console.log('Token 3:', token3);
		

		if (userid && token1 && token2 && token3) {	
		} else {
			return
		}
		
		// 在这里调用 fetchSequentially，处理结果或者错误
		fetchSequentially(userid, token1, token2, token3)
			.then(reportList => {
				console.log('Sequential fetch completed with result:', reportList);
				// 在这里处理获取到的 reportList
				console.log(reportList[0]['col1']);
				const jsonObject = JSON.parse(reportList[0]['col1']);
				console.log(jsonObject);
				//{
				//	"表格标题": "大标题",
				//	"表格首行": ["标题A","标题B","标题C"],
				//	"表格内容": [["A1","B1","C1"],["A2","B2","C2"]]
				//}
				
				const documentTitle = jsonObject['网页标题'];
				if (documentTitle){
					document.title = documentTitle;
				}
				const tableTitle = jsonObject['表格标题'];
				const headers = jsonObject['表格首行'];
				const content = jsonObject['表格内容'];
				// 调用函数，传入数据来填充表格
				populateTable(tableTitle, headers, content);

			})
			.catch(error => {
				console.error('Sequential fetch failed:', error);
				// 在这里处理错误
			});
		
		
		
	} catch (error) {
		console.error('Error:', error.message);
		//alert('Error: ' + error.message);
	}
	
	
});





