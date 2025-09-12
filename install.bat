@echo off
REM MIT 6.828 实验文档增强安装脚本 (Windows版本)
echo MIT 6.828 实验文档现代化增强安装程序
echo ==========================================

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 没有找到Python，请先安装Python 3
    pause
    exit /b 1
)

REM 运行安装脚本
echo.
echo 正在安装增强功能...
python install-enhancements.py --backup

echo.
echo 安装完成！按任意键继续...
pause >nul
