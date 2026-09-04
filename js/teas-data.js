// ============================================================
// 喝遍全国 · 茶叶数据（依据用户整理的茶品与品牌汇总）
// 评分说明：原文为 10 分制，此处已换算为 5 分制（原分 ÷ 2）
// ============================================================

// 各茶类通用冲泡手法
const BREW = {
  绿茶: {
    waterTemp: '80 - 85℃',
    utensil: '玻璃杯 / 盖碗',
    ratio: '3g 茶叶 : 150ml 水',
    time: '首泡 1 分钟',
    steps: ['温杯：沸水烫洗玻璃杯', '投茶：投入约 3g 茶叶', '注水：80-85℃ 水沿杯壁缓注', '静候：约 1 分钟后出汤', '品饮：感受清香与回甘']
  },
  红茶: {
    waterTemp: '90 - 95℃',
    utensil: '盖碗 / 瓷壶',
    ratio: '5g 茶叶 : 150ml 水',
    time: '首泡 5 - 10 秒',
    steps: ['温杯：沸水烫洗茶具', '投茶：投入约 5g 茶叶', '注水：90-95℃ 水沿壁注入', '出汤：5-10 秒快速出汤', '品饮：感受甜醇与蜜香']
  },
  乌龙茶: {
    waterTemp: '100℃',
    utensil: '盖碗 / 紫砂壶',
    ratio: '7-8g 茶叶 : 110ml 水',
    time: '快进快出',
    steps: ['温壶：沸水烫洗茶具', '投茶：投入 7-8g 茶叶', '洗茶：沸水快速润茶一遍', '冲泡：沸水冲泡，快速出汤', '续泡：每泡可延长 5-10 秒']
  },
  白茶: {
    waterTemp: '90℃',
    utensil: '玻璃杯 / 盖碗',
    ratio: '3g 茶叶 : 150ml 水',
    time: '首泡 1 - 2 分钟',
    steps: ['温杯：沸水烫洗茶具', '投茶：投入约 3g 茶叶', '注水：90℃ 水沿壁缓注', '静候：1-2 分钟后出汤', '品饮：感受毫香与清甜']
  },
  黑茶: {
    waterTemp: '100℃',
    utensil: '紫砂壶 / 盖碗',
    ratio: '8g 茶叶 : 150ml 水',
    time: '洗茶后快出汤',
    steps: ['温壶：沸水烫壶', '投茶：投入约 8g 茶叶', '洗茶：沸水洗茶 1-2 遍', '冲泡：沸水冲泡出汤', '续泡：可冲泡十余泡']
  },
  黄茶: {
    waterTemp: '85℃',
    utensil: '玻璃杯',
    ratio: '3g 茶叶 : 150ml 水',
    time: '首泡 2 分钟',
    steps: ['温杯：沸水烫洗玻璃杯', '投茶：投入约 3g 茶叶', '注水：85℃ 水缓注', '静候：约 2 分钟', '品饮：感受甜醇与毫香']
  },
  花茶: {
    waterTemp: '85℃',
    utensil: '玻璃杯',
    ratio: '3g 茶叶 : 150ml 水',
    time: '首泡 1 分钟',
    steps: ['温杯：沸水烫洗玻璃杯', '投茶：投入约 3g 茶叶', '注水：85℃ 水缓注', '静候：约 1 分钟', '品饮：花香四溢，鲜灵甘爽']
  }
};

const TEAS = [
  // ============ 绿茶 ============
  { id: 'longjing43', name: '龙井43号', type: '绿茶', origin: '浙江 · 杭州西湖', flavor: ['豆香', '清香', '鲜爽'], image: 'Picture/longjing43.png', description: '龙井茶的国家级良种，发芽早、香气清高，是西湖龙井的主力品种。', brewing: BREW['绿茶'], varieties: [{ name: '狮牌' }, { name: '贡牌' }] },
  { id: 'biluochun', name: '碧螺春', type: '绿茶', origin: '江苏 · 苏州洞庭山', flavor: ['花果香', '鲜甜', '毫香'], image: 'Picture/biluochun.png', description: '卷曲如螺、白毫显露，茶果间作带来独特花果香。', brewing: BREW['绿茶'], varieties: [{ name: '碧螺牌' }, { name: '艺福堂' }, { name: '一杯香' }, { name: '三万昌' }] },
  { id: 'zhu ye qing', name: '竹叶青', type: '绿茶', origin: '四川 · 峨眉山', flavor: ['嫩栗香', '清鲜', '回甘'], image: 'Picture/zhuyeqing.png', description: '产自峨眉山，扁平挺直如竹叶，嫩栗香清鲜回甘。', brewing: BREW['绿茶'], varieties: [{ name: '竹叶青' }] },
  { id: 'xinyangmaojian', name: '信阳毛尖', type: '绿茶', origin: '河南 · 信阳', flavor: ['板栗香', '鲜爽', '浓醇'], image: 'Picture/xinyangmaojian.png', description: '细圆光直、多白毫，香气清高，有独特板栗香。', brewing: BREW['绿茶'], varieties: [{ name: '文新' }, { name: '龙潭' }] },
  { id: 'huangshanmaofeng', name: '黄山毛峰', type: '绿茶', origin: '安徽 · 黄山', flavor: ['兰花香', '鲜醇', '毫香'], image: 'Picture/huangshanmaofeng.png', description: '形似雀舌、白毫披身，兰花香显，滋味鲜醇。', brewing: BREW['绿茶'], varieties: [{ name: '谢裕大' }] },
  { id: 'taipinghoukui', name: '太平猴魁', type: '绿茶', origin: '安徽 · 黄山', flavor: ['兰花香', '鲜爽', '魁韵'], image: 'Picture/taipinghoukui.png', description: '两叶抱芽、扁平挺直，兰花香高长，有独特"猴韵"。', brewing: BREW['绿茶'], varieties: [{ name: '猴坑' }] },
  { id: 'enshiyulu', name: '恩施玉露', type: '绿茶', origin: '湖北 · 恩施', flavor: ['蒸青香', '鲜爽', '海苔香'], image: 'Picture/enshiyulu.png', description: '少有的蒸青绿茶，汤色嫩绿，带海苔香，鲜爽回甘。', brewing: BREW['绿茶'], varieties: [] },
  { id: 'lushanyunwu', name: '庐山云雾', type: '绿茶', origin: '江西 · 庐山', flavor: ['云雾香', '鲜爽', '回甘'], image: 'Picture/lushanyunwu.png', description: '高山云雾出好茶，香高味浓，鲜爽持久。', brewing: BREW['绿茶'], varieties: [] },
  { id: 'yongchuanxiuya', name: '永川秀芽', type: '绿茶', origin: '重庆 · 永川', flavor: ['嫩香', '鲜爽', '回甘'], image: 'Picture/yongchuanxiuya.png', description: '重庆名茶，外形秀丽，嫩香鲜爽，回甘明显。', brewing: BREW['绿茶'], varieties: [] },
  { id: 'anjibaicha', name: '安吉白茶', type: '绿茶', origin: '浙江 · 安吉', flavor: ['鲜甜', '清香', '豆香'], image: 'Picture/anjibaicha.png', description: '名为白茶实为绿茶，氨基酸含量高，鲜甜如鸡汤。', brewing: BREW['绿茶'], varieties: [{ name: '宋茗' }] },
  { id: 'duyunmaojian', name: '都匀毛尖', type: '绿茶', origin: '贵州 · 都匀', flavor: ['嫩香', '鲜爽', '回甘'], image: 'Picture/duyunmaojian.png', description: '贵州名茶，卷曲披毫，嫩香持久，鲜爽回甘。', brewing: BREW['绿茶'], varieties: [{ name: '贵天下' }] },
  { id: 'nanyueyunwu', name: '南岳云雾茶', type: '绿茶', origin: '湖南 · 衡山', flavor: ['清香', '微甘', '鲜爽'], image: 'Picture/nanyueyunwu.png', description: '衡山高山茶，清香微甘，滋味鲜爽。', brewing: BREW['绿茶'], varieties: [{ name: '寿岳 · 芽尖', rating: 2.95, price: 20, reviews: [{ user: '我的评价', rating: 2.95, content: '芽尖，味淡伴有微甘。' }] }] },
  { id: 'liuanguapian', name: '六安瓜片', type: '绿茶', origin: '安徽 · 六安', flavor: ['兰香', '鲜爽', '油润'], image: 'Picture/liuanguapian.png', description: '唯一无芽无梗的单片绿茶，兰香鲜爽，入口油润。', brewing: BREW['绿茶'], varieties: [{ name: '徽六', rating: 4.1, price: 36, reviews: [{ user: '我的评价', rating: 4.1, content: '叶大，香而极鲜，入口油润；久泡发苦似苦瓜，宜快出汤。' }] }] },

  // ============ 红茶 ============
  { id: 'zhengshanxiaozhong', name: '正山小种', type: '红茶', origin: '福建 · 武夷山', flavor: ['松烟香', '桂圆汤', '醇和'], image: 'Picture/zhengshanxiaozhong.png', description: '世界红茶鼻祖，松烟香与桂圆汤味独特。', brewing: BREW['红茶'], varieties: [{ name: '正山堂' }, { name: '元正' }] },
  { id: 'dianhong', name: '滇红', type: '红茶', origin: '云南 · 凤庆', flavor: ['蜜香', '甜醇', '浓厚'], image: 'Picture/dianhong.png', description: '云南大叶种红茶，蜜香浓郁，滋味浓厚甜醇。', brewing: BREW['红茶'], varieties: [{ name: '凤牌' }] },
  { id: 'yinghong', name: '英红', type: '红茶', origin: '广东 · 英德', flavor: ['花果香', '甜爽', '浓强'], image: 'Picture/yinghong.png', description: '广东英德红茶，花果香明显，浓强甜爽。', brewing: BREW['红茶'], varieties: [{ name: '英红九号' }] },
  { id: 'jinjunmei', name: '金骏眉', type: '红茶', origin: '福建 · 武夷山', flavor: ['蜜香', '果香', '甜醇'], image: 'Picture/jinjunmei.png', description: '全芽头红茶，蜜香果香，汤色金黄甜醇。', brewing: BREW['红茶'], varieties: [] },
  { id: 'chuanhong', name: '川红', type: '红茶', origin: '四川 · 宜宾', flavor: ['橘糖香', '甜醇', '浓厚'], image: 'Picture/chuanhong.png', description: '四川红茶，带橘糖香，滋味浓厚。', brewing: BREW['红茶'], varieties: [{ name: '川红集团' }] },
  { id: 'jiuquhongmei', name: '九曲红梅', type: '红茶', origin: '浙江 · 杭州', flavor: ['梅香', '甜醇', '柔和'], image: 'Picture/jiuquhongmei.png', description: '杭州红茶，形似红梅，梅香清雅，甜醇柔和。', brewing: BREW['红茶'], varieties: [{ name: '狮峰' }] },
  { id: 'qihong', name: '祁红', type: '红茶', origin: '安徽 · 祁门', flavor: ['祁门香', '蜜糖香', '醇厚'], image: 'Picture/qihong.png', description: '世界三大高香红茶之一，"祁门香"馥郁，滋味醇厚。', brewing: BREW['红茶'], varieties: [{ name: '天之红' }] },

  // ============ 白茶 ============
  { id: 'baihaoyinzhen', name: '白毫银针', type: '白茶', origin: '福建 · 福鼎', flavor: ['毫香', '清甜', '鲜爽'], image: 'Picture/baihaoyinzhen.png', description: '全芽头白茶，满披白毫，毫香清甜。', brewing: BREW['白茶'], varieties: [{ name: '品品香' }, { name: '绿雪芽' }] },
  { id: 'baimudan', name: '白牡丹', type: '白茶', origin: '福建 · 福鼎', flavor: ['花香', '清甜', '醇和'], image: 'Picture/baimudan.png', description: '一芽二叶，形似牡丹，花香清甜。', brewing: BREW['白茶'], varieties: [{ name: '品品香' }, { name: '绿雪芽' }] },
  { id: 'baiyueguang', name: '月光白', type: '白茶', origin: '云南 · 普洱', flavor: ['蜜香', '甜润', '柔和'], image: 'Picture/baiyueguang.png', description: '月光白，又称月光美人、月光白茶，是一款产自云南省思茅地区的白茶，以其独特的采制工艺、黑白相间的干茶外形和浓郁的毫香蜜韵而闻名。月光白又名月光美人，也被称为月光白茶、月光茶。其采摘手法独特，须在月光下制作，每批茶叶的粗制要在一天内完成。', brewing: BREW['白茶'], varieties: [{ name: '月下美人' }] },
  { id: 'gongmei', name: '贡眉', type: '白茶', origin: '福建 · 福鼎', flavor: ['甜醇', '枣香', '温和'], image: 'Picture/gongmei.png', description: '以菜茶芽叶制成，甜醇温和，带枣香。', brewing: BREW['白茶'], varieties: [] },
  { id: 'shoumei', name: '寿眉', type: '白茶', origin: '福建 · 福鼎', flavor: ['甜醇', '枣香', '陈香'], image: 'Picture/shoumei.png', description: '粗枝大叶的白茶，甜醇枣香，陈放更佳。', brewing: BREW['白茶'], varieties: [] },

  // ============ 花茶 ============
  { id: 'molihuacha', name: '茉莉花茶', type: '花茶', origin: '广西 · 横州', flavor: ['茉莉花香', '清甜', '鲜灵'], image: 'Picture/molihuacha.png', description: '绿茶茶坯与茉莉花多次窨制，花香鲜灵持久。', brewing: BREW['花茶'], varieties: [{ name: '九窨茉莉听雪', rating: 3.4, price: 99.5, reviews: [{ user: '我的评价', rating: 3.4, content: '香气充盈、久泡发涩；不适合闷泡，推荐冷泡。' }] }, { name: '榕莉' }, { name: '张一元' }] },

  // ============ 乌龙茶 ============
  { id: 'dongdingwulong', name: '冻顶乌龙', type: '乌龙茶', origin: '台湾 · 南投', flavor: ['焙火香', '奶香', '醇厚'], image: 'Picture/dongdingwulong.png', description: '台湾名茶，焙火香与奶香交融，醇厚回甘。', brewing: BREW['乌龙茶'], varieties: [{ name: '顺记茗茶' }] },
  { id: 'jinxuanwulong', name: '金萱乌龙', type: '乌龙茶', origin: '台湾 · 阿里山', flavor: ['奶香', '花香', '清甜'], image: 'Picture/jinxuanwulong.png', description: '台湾乌龙，独特天然奶香，清甜柔和。', brewing: BREW['乌龙茶'], varieties: [] },
  { id: 'dongfangmeiren', name: '东方美人', type: '乌龙茶', origin: '台湾 · 新竹', flavor: ['蜜香', '果香', '熟果香'], image: 'Picture/dongfangmeiren.png', description: '经小绿叶蝉叮咬，蜜香果香独特，汤色琥珀。', brewing: BREW['乌龙茶'], varieties: [] },
  { id: 'tieguanyin', name: '铁观音', type: '乌龙茶', origin: '福建 · 安溪', flavor: ['兰花香', '观音韵', '醇厚'], image: 'Picture/tieguanyin.png', description: '安溪乌龙代表，兰花香与观音韵兼具。', brewing: BREW['乌龙茶'], varieties: [{ name: '中茶海堤' }, { name: '八马' }, { name: '日春' }] },
  { id: 'wuyiyancha', name: '武夷岩茶', type: '乌龙茶', origin: '福建 · 武夷山', flavor: ['岩韵', '焦糖香', '兰花香'], image: 'Picture/wuyiyancha.png', description: '武夷山岩茶，岩骨花香，韵味悠长。', brewing: BREW['乌龙茶'], varieties: [{ name: '武夷星' }, { name: '幔亭mt209' }] },
  { id: 'zhangpingshuixian', name: '漳平水仙', type: '乌龙茶', origin: '福建 · 漳平', flavor: ['兰花韵', '清雅', '甘醇'], image: 'Picture/zhangpingshuixian.png', description: '唯一紧压成型的乌龙茶，兰花香清雅，甘醇。', brewing: BREW['乌龙茶'], varieties: [{ name: '九鹏' }, { name: '研茶苑', rating: 4.3, price: 13.9, reviews: [{ user: '我的评价', rating: 4.3, content: '汤色金黄透亮，兰花香气馥郁清晰，入口柔且香，回甘明显。' }] }] },
  { id: 'fenghuangdancong', name: '凤凰单枞', type: '乌龙茶', origin: '广东 · 潮州凤凰山', flavor: ['蜜兰香', '花香', '回甘'], image: 'Picture/fenghuangdancong.png', description: '潮州凤凰山乌龙，蜜兰香、鸭屎香等香型丰富。', brewing: BREW['乌龙茶'], varieties: [
    { name: '蜜兰香', brand: '茶米烟火', rating: 4.05, reviews: [{ user: '我的评价', rating: 4.05, content: '色泽红亮，叶片大而整齐，约 7-8 泡之后变淡，香气明显。' }] },
    { name: '鸭屎香', price: 40 },
    { name: '雪中香雪片鸭屎香', brand: '南馥', rating: 3.8, price: 35.71, reviews: [{ user: '我的评价', rating: 3.8, content: '色泽显黄、味道较淡；久泡发苦、香气突出，宜快出汤。' }] },
    { name: '春茶蜜兰香', rating: 4.6, price: 26, reviews: [{ user: '我的评价', rating: 4.6, content: '色醇且亮，入口香气四溢，伴有回甘。' }] },
    { name: '黄枝香', brand: '宋凰', price: 25.67 }
  ] },

  // ============ 黑茶 ============
  { id: 'anhuaheicha', name: '安化黑茶', type: '黑茶', origin: '湖南 · 安化', flavor: ['松烟香', '醇厚', '陈香'], image: 'Picture/anhuaheicha.png', description: '湖南安化黑茶，松烟香陈香，醇厚耐泡。', brewing: BREW['黑茶'], varieties: [{ name: '白沙溪' }, { name: '湘丰' }] },
  { id: 'fuzhuancha', name: '茯砖茶', type: '黑茶', origin: '陕西 · 泾阳', flavor: ['菌花香', '醇和', '陈香'], image: 'Picture/fuzhuancha.png', description: '含"金花"的黑茶，菌花香，醇和暖胃。', brewing: BREW['黑茶'], varieties: [{ name: '湘益' }, { name: '泾渭茯茶' }] },
  { id: 'yaanzangcha', name: '雅安藏茶', type: '黑茶', origin: '四川 · 雅安', flavor: ['陈香', '醇厚', '红浓'], image: 'Picture/yaanzangcha.png', description: '四川雅安黑茶，陈香红浓，适合煮饮。', brewing: BREW['黑茶'], varieties: [{ name: '雅安茶厂' }] },
  { id: 'liubaocha', name: '六堡茶', type: '黑茶', origin: '广西 · 梧州', flavor: ['槟榔香', '陈香', '醇滑'], image: 'Picture/liubaocha.png', description: '广西梧州黑茶，槟榔香陈香，醇滑。', brewing: BREW['黑茶'], varieties: [{ name: '三鹤' }, { name: '中茶' }] },
  { id: 'puercha', name: '普洱茶', type: '黑茶', origin: '云南', flavor: ['陈香', '醇厚', '回甘'], image: 'Picture/puercha.png', description: '云南大叶种后发酵茶，陈香醇厚，越陈越香。', brewing: BREW['黑茶'], varieties: [{ name: '勐海七子饼' }, { name: '大益' }, { name: '中茶' }, { name: '下关沱茶' }] },

  // ============ 黄茶 ============
  { id: 'junshanyinzhen', name: '君山银针', type: '黄茶', origin: '湖南 · 岳阳洞庭湖', flavor: ['毫香', '甜醇', '黄汤'], image: 'Picture/junshanyinzhen.png', description: '黄茶珍品，芽头挺直，冲泡后三起三落。', brewing: BREW['黄茶'], varieties: [{ name: '君山茶叶' }] },
  { id: 'mengdinghuangya', name: '蒙顶黄芽', type: '黄茶', origin: '四川 · 雅安蒙顶山', flavor: ['嫩香', '甜醇', '黄汤'], image: 'Picture/mengdinghuangya.png', description: '蒙顶山黄茶，嫩香甜醇，黄汤黄叶。', brewing: BREW['黄茶'], varieties: [{ name: '跃华茶' }, { name: '蒙顶山' }] },
  { id: 'huoshanhuangya', name: '霍山黄芽', type: '黄茶', origin: '安徽 · 霍山', flavor: ['嫩香', '甜醇', '鲜爽'], image: 'Picture/huoshanhuangya.png', description: '安徽黄茶，嫩香鲜爽，甜醇回甘。', brewing: BREW['黄茶'], varieties: [{ name: '抱儿钟秀' }] }
];
