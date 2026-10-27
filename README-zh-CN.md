# 适用于Liquipedia HoK Wiki的BP低代码编辑器

本项目实现了 ***[Liquipedia](https://liquipedia.net/honorofkings/)*** 的 *Ban&Picks* 格式化输出，降低了由于输出错误导致的增加检查成本，并提升了一定的编写效率。

#### 页面效果

![主界面](images/01.png)

#### 输出效果

##### 标准输出示例 （弃用）

``` wikitext
        |team1side=blue|team2side=red|length=99:59|winner=1
        <!-- Hero picks -->
        |t1h1=agudo|t1h2=agudo|t1h3=agudo|t1h4=agudo|t1h5=agudo
        |t2h1=agudo|t2h2=agudo|t2h3=agudo|t2h4=agudo|t2h5=agudo
        <!-- Hero bans-->
        |t1b1=agudo|t1b2=agudo|t1b3=agudo|t1b4=agudo|t1b5=agudo
        |t2b1=agudo|t2b2=agudo|t2b3=agudo|t2b4=agudo|t2b5=agudo
```

##### 标准输出示例

``` wikitext
        |team1side=blue |team2side=red |length=99:59 |winner=1
        <!-- Hero picks -->
        |t1h1=agudo |t1h2=agudo |t1h3=agudo |t1h4=agudo |t1h5=agudo
        |t2h1=agudo |t2h2=agudo |t2h3=agudo |t2h4=agudo |t2h5=agudo
        <!-- Hero bans-->
        |t1b1=agudo |t1b2=agudo |t1b3=agudo |t1b4=agudo |t1b5=agudo
        |t2b1=agudo |t2b2=agudo |t2b3=agudo |t2b4=agudo |t2b5=agudo
```

##### 5个禁用

``` wikitext
        |team1side=blue |team2side=red |length=00:00 |winner=1
        <!-- Hero picks -->
        |t1h1= |t1h2= |t1h3= |t1h4= |t1h5=
        |t2h1= |t2h2= |t2h3= |t2h4= |t2h5=
        <!-- Hero bans-->
        |t1b1= |t1b2= |t1b3= |t1b4= |t1b5=
        |t2b1= |t2b2= |t2b3= |t2b4= |t2b5=
```

##### 4个禁用

``` wikitext
        |team1side=blue |team2side=red |length=00:00 |winner=1
        <!-- Hero picks -->
        |t1h1= |t1h2= |t1h3= |t1h4= |t1h5=
        |t2h1= |t2h2= |t2h3= |t2h4= |t2h5=
        <!-- Hero bans-->
        |t1b1= |t1b2= |t1b3= |t1b4=
        |t2b1= |t2b2= |t2b3= |t2b4=
```

##### 巅峰对决

``` wikitext
        |team1side=blue |team2side=red |length=00:00 |winner=1
        <!-- Hero picks -->
        |t1h1= |t1h2= |t1h3= |t1h4= |t1h5=
        |t2h1= |t2h2= |t2h3= |t2h4= |t2h5=
```

##### 只需要选择

```wikitext
        <!-- Hero picks -->
        |t1h1= |t1h2= |t1h3= |t1h4= |t1h5=
        |t2h1= |t2h2= |t2h3= |t2h4= |t2h5=
```

##### 只需要4个禁用

```wikitext
        <!-- Hero bans-->
        |t1b1= |t1b2= |t1b3= |t1b4=
        |t2b1= |t2b2= |t2b3= |t2b4=
```

##### 只需要5个禁用

```wikitext
        <!-- Hero bans-->
        |t1b1= |t1b2= |t1b3= |t1b4= |t1b5=
        |t2b1= |t2b2= |t2b3= |t2b4= |t2b5=
```

##### 只需要禁用和选择

```wikitext
        <!-- Hero picks -->
        |t1h1= |t1h2= |t1h3= |t1h4= |t1h5=
        |t2h1= |t2h2= |t2h3= |t2h4= |t2h5=
        <!-- Hero bans-->
        |t1b1= |t1b2= |t1b3= |t1b4= |t1b5=
        |t2b1= |t2b2= |t2b3= |t2b4= |t2b5=
```

##### 比赛正在进行

```wikitext
        |team1side=blue |team2side=red |length= |winner=
        <!-- Hero picks -->
        |t1h1= |t1h2= |t1h3= |t1h4= |t1h5=
        |t2h1= |t2h2= |t2h3= |t2h4= |t2h5=
        <!-- Hero bans-->
        |t1b1= |t1b2= |t1b3= |t1b4= |t1b5=
        |t2b1= |t2b2= |t2b3= |t2b4= |t2b5=
```

#### 使用指南

> **注意** —— 请通过 HTTP 服务打开页面（VS Code 的 **Live Server**、`python -m http.server` 等）。浏览器不允许从 `file://` 路径读取 `data.json`。

##### 1. 选择模式
「模式」功能区内是五个单选项，同时只能选一个，默认选中**标准模式**：

| 选项 | 输出内容 |
| --- | --- |
| 标准模式（默认） | 选边/时长/胜方 + 选择 + 禁用 |
| 巅峰对决 | 选边/时长/胜方 + 选择 |
| 仅禁用 | 仅禁用 |
| 仅选择 | 仅选择 |
| 仅选择&禁用 | 选择 + 禁用 |

##### 2. 填写比赛信息
- **BanNums** —— 每队 4 或 5 个禁用位，多余的输入框会自动隐藏。
- **比赛进行中** —— 时长与胜方留空。
- **无需空格** —— 匹配英雄时，你输入的内容与英雄名/别名**双方都会先去掉空格**，所以 `flowborn assassin` 也能匹配到 `Flowborn (Assassin)`。

##### 3. 选择阵营与胜方
`Team1Side`、`Winner`、`换边` 都是点击切换的按钮：

- `Team1Side` —— 在蓝/红之间切换，队伍2 自动取相反颜色
- `Winner` —— 在队伍1/队伍2 之间切换
- `换边` —— 交换两队的输入区，同时把 Team1Side 切到红色

三项都会记在 Cookie 里。

##### 4. 输入时长
`MM` 与 `SS` 只接受数字，失焦后自动补零；留空按 `00:00` 输出。

##### 5. 填写英雄
每队 5 个选择位、最多 5 个禁用位。输入完整英雄名**或任意别名**，然后从下拉列表中选择：

- 红框 —— 未匹配到英雄，该项会输出为空
- 黄框 —— 匹配到多个英雄，请从列表中选择
- 高亮 —— 同一英雄填入多个输入框，输入区下方会给出提示

##### 6. 键盘操作
`Tab` / `Shift`+`Tab` 在输入框与按钮之间切换。英雄候选列表展开时，`↑` / `↓` 移动高亮项，`Enter` 确认高亮项，`Esc` 关闭列表。

##### 7. 管理英雄别名
通过**搜索/更新英雄别名或添加英雄**修改别名、新增或删除英雄。改动只保存在本浏览器，并会在下次加载时与更新后的 `data.json` 合并：你改过的别名和自己添加的英雄会保留，上游新增英雄会自动引入，上游删除的英雄也会本地删除。需要彻底重置时使用**清空本地存储**。

##### 手动部署
推荐使用***VS Code***的***Live Server***插件部署此项目，带来的诸多不便敬请谅解。

##### 别名数据格式
BP输入框支持提示词，本项目支持了***Honor of Kings（包括国际服）*** 的绝大部分别名提示，您也可以通过修改 ***data.json*** 进行更新。支持一个英雄设置多个 **别名**，字段对应如下：

| 名称  | 值           |
| ----- | ------------ |
| value | 最终的输出值 |
| text  | 提示词       |
| alias | 自定义的别名 |

##### 在线更新
**搜索和修改**

直接新建行并添加您需要的别名

![搜索和修改](images/02.png)

**新增**

![新增](images/03.png)

#### 最后

由于时间仓促，本项目存在诸多不足，欢迎通过Issue向我提出！
