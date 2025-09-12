#!/usr/bin/env python3
"""
MIT 6.828 实验文档增强安装脚本
自动为实验HTML文件添加现代化样式和功能

使用方法:
    python3 install-enhancements.py
    python3 install-enhancements.py --backup  # 创建备份
    python3 install-enhancements.py --restore # 恢复备份
"""

import os
import shutil
import re
import argparse
from pathlib import Path

class LabEnhancementInstaller:
    def __init__(self):
        self.current_dir = Path.cwd()
        self.lab_files = []
        self.backup_dir = self.current_dir / "backups"
        
        # 查找所有实验HTML文件
        self.find_lab_files()
    
    def find_lab_files(self):
        """查找所有MIT 6.828实验HTML文件"""
        patterns = [
            "Lab*.html",
            "lab*.html",
            "*Lab*.html"
        ]
        
        for pattern in patterns:
            for file in self.current_dir.glob(pattern):
                self.lab_files.append(file)
        
        # 去重并排序
        self.lab_files = sorted(list(set(self.lab_files)))
        
        print(f"找到 {len(self.lab_files)} 个实验文档文件:")
        for file in self.lab_files:
            print(f"  - {file.name}")
    
    def create_backup(self):
        """创建原始文件的备份"""
        if not self.backup_dir.exists():
            self.backup_dir.mkdir()
            print(f"创建备份目录: {self.backup_dir}")
        
        for file in self.lab_files:
            backup_file = self.backup_dir / file.name
            if not backup_file.exists():
                shutil.copy2(file, backup_file)
                print(f"备份文件: {file.name} -> {backup_file}")
            else:
                print(f"备份已存在: {backup_file}")
    
    def restore_backup(self):
        """从备份恢复原始文件"""
        if not self.backup_dir.exists():
            print("错误: 没有找到备份目录")
            return False
        
        restored_count = 0
        for file in self.lab_files:
            backup_file = self.backup_dir / file.name
            if backup_file.exists():
                shutil.copy2(backup_file, file)
                print(f"恢复文件: {backup_file} -> {file.name}")
                restored_count += 1
            else:
                print(f"警告: 没有找到备份文件 {backup_file}")
        
        print(f"总共恢复了 {restored_count} 个文件")
        return restored_count > 0
    
    def check_enhancement_files(self):
        """检查增强文件是否存在"""
        required_files = ["labs-modern.css", "labs-enhance.js"]
        missing_files = []
        
        for file in required_files:
            if not (self.current_dir / file).exists():
                missing_files.append(file)
        
        if missing_files:
            print("错误: 缺少以下增强文件:")
            for file in missing_files:
                print(f"  - {file}")
            return False
        
        return True
    
    def enhance_html_file(self, file_path):
        """为单个HTML文件添加增强功能"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            # 尝试其他编码
            try:
                with open(file_path, 'r', encoding='windows-1252') as f:
                    content = f.read()
            except UnicodeDecodeError:
                with open(file_path, 'r', encoding='iso-8859-1') as f:
                    content = f.read()
        
        # 检查是否已经增强过
        if 'labs-modern.css' in content and 'labs-enhance.js' in content:
            print(f"  {file_path.name} 已经增强过，跳过")
            return False
        
        # 修复字符编码问题
        content = content.replace('charset=windows-1252', 'charset=UTF-8')
        content = content.replace('charset="windows-1252"', 'charset="UTF-8"')
        
        # 移除可能存在的重复增强代码
        content = re.sub(r'<!-- MIT 6\.828 实验文档现代化增强 -->.*?<script src="labs-enhance\.js"></script>\s*', '', content, flags=re.DOTALL)
        
        # 查找</head>标签的位置（在清理后的内容中）
        head_pattern = r'</head>'
        head_match = re.search(head_pattern, content, re.IGNORECASE)
        
        if not head_match:
            print(f"  警告: 在 {file_path.name} 中没有找到 </head> 标签")
            return False
        
        # 准备要插入的代码
        enhancement_code = '''
<!-- MIT 6.828 实验文档现代化增强 -->
<link rel="stylesheet" href="labs-modern.css" type="text/css">
<script src="labs-enhance.js"></script>
'''
        
        # 在</head>前插入增强代码
        insert_position = head_match.start()
        enhanced_content = (
            content[:insert_position] + 
            enhancement_code + 
            content[insert_position:]
        )
        
        # 写回文件
        # 写入增强后的内容（使用UTF-8编码）
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(enhanced_content)
        
        print(f"  ✓ {file_path.name} 已增强")
        return True
    
    def install_enhancements(self, create_backup=True):
        """安装增强功能到所有实验文件"""
        if not self.check_enhancement_files():
            return False
        
        if len(self.lab_files) == 0:
            print("没有找到实验HTML文件")
            return False
        
        if create_backup:
            self.create_backup()
        
        print("\n开始增强实验文档...")
        enhanced_count = 0
        
        for file in self.lab_files:
            if self.enhance_html_file(file):
                enhanced_count += 1
        
        print(f"\n✅ 完成! 总共增强了 {enhanced_count} 个文件")
        
        if enhanced_count > 0:
            print("\n📖 现在您可以:")
            print("1. 在浏览器中打开任何实验HTML文件")
            print("2. 享受现代化的阅读体验!")
            print("3. 使用右下角的主题切换按钮")
            print("4. 点击代码块的复制按钮复制代码")
            print("\n如果需要恢复原始文件，运行:")
            print("python3 install-enhancements.py --restore")
        
        return enhanced_count > 0
    
    def show_status(self):
        """显示当前状态"""
        print("MIT 6.828 实验文档增强状态\n")
        
        # 检查增强文件
        enhancement_files = ["labs-modern.css", "labs-enhance.js"]
        print("增强文件状态:")
        for file in enhancement_files:
            exists = (self.current_dir / file).exists()
            status = "✓ 存在" if exists else "✗ 缺失"
            print(f"  {file}: {status}")
        
        # 检查备份
        backup_exists = self.backup_dir.exists()
        backup_status = "✓ 存在" if backup_exists else "✗ 不存在"
        print(f"\n备份目录: {backup_status}")
        
        if backup_exists:
            backup_files = list(self.backup_dir.glob("*.html"))
            print(f"  备份文件数量: {len(backup_files)}")
        
        # 检查实验文件增强状态
        print(f"\n实验文档状态 (共 {len(self.lab_files)} 个文件):")
        if len(self.lab_files) == 0:
            print("  没有找到实验HTML文件")
        else:
            for file in self.lab_files:
                try:
                    with open(file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        enhanced = 'labs-modern.css' in content and 'labs-enhance.js' in content
                        status = "✓ 已增强" if enhanced else "○ 未增强"
                        print(f"  {file.name}: {status}")
                except Exception as e:
                    print(f"  {file.name}: ✗ 读取错误")

def main():
    parser = argparse.ArgumentParser(
        description='MIT 6.828 实验文档增强安装脚本',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python3 install-enhancements.py           # 安装增强功能
  python3 install-enhancements.py --backup  # 安装并创建备份
  python3 install-enhancements.py --restore # 恢复原始文件
  python3 install-enhancements.py --status  # 查看状态
        """
    )
    
    parser.add_argument('--backup', action='store_true',
                       help='创建原始文件的备份')
    parser.add_argument('--restore', action='store_true',
                       help='从备份恢复原始文件')
    parser.add_argument('--status', action='store_true',
                       help='显示当前增强状态')
    parser.add_argument('--no-backup', action='store_true',
                       help='安装时不创建备份')
    
    args = parser.parse_args()
    
    installer = LabEnhancementInstaller()
    
    if args.status:
        installer.show_status()
    elif args.restore:
        installer.restore_backup()
    else:
        # 默认安装增强功能
        create_backup = not args.no_backup
        installer.install_enhancements(create_backup=create_backup)

if __name__ == "__main__":
    main()
