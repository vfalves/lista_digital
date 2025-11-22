from fastapi import FastAPI, APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, time
from supabase import create_client, Client
import io
import random
import string
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase connection
supabase_url = os.environ['SUPABASE_URL']
supabase_key = os.environ['SUPABASE_KEY']
supabase: Client = create_client(supabase_url, supabase_key)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ===========================
# UTILITY FUNCTIONS
# ===========================

def generate_registration_code():
    """Gera um código único de registro no formato PRF-YYYY-XXXX"""
    year = datetime.now().year
    # Gera 4 caracteres alfanuméricos aleatórios
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"PRF-{year}-{random_part}"


# ===========================
# MODELS
# ===========================

class ProfessionalCreate(BaseModel):
    code: str  # credential_id em base64 (opcional se usar apenas registro)
    name: str
    email: EmailStr
    profession: str
    company: str

class ProfessionalResponse(BaseModel):
    id: str
    code: str
    registration_code: Optional[str] = None  # Código único de registro
    name: str
    email: str
    profession: str
    company: str
    created_at: str

class AttendanceListCreate(BaseModel):
    installation_name: str
    meeting_date: str  # YYYY-MM-DD
    meeting_time: str  # HH:MM
    course_title: str
    course_content: str
    instructor_name: str
    instructor_role: str
    instructor_qualification: str
    location: str

class AttendanceListResponse(BaseModel):
    id: str
    installation_name: str
    meeting_date: str
    meeting_time: str
    duration: Optional[str] = None
    course_title: str
    course_content: str
    instructor_name: str
    instructor_role: str
    instructor_qualification: str
    location: str
    start_time: str
    end_time: Optional[str] = None
    status: str
    created_at: str

class AttendanceRecordCreate(BaseModel):
    list_id: str
    code: str  # credential_id para buscar o professional

class AttendanceRecordResponse(BaseModel):
    id: str
    list_id: str
    professional_id: str
    professional_name: str
    professional_email: str
    professional_profession: str
    professional_company: str
    entry_time: str
    local: str
    row_number: int
    created_at: str


# ===========================
# PROFESSIONALS ENDPOINTS
# ===========================

@api_router.post("/professionals", response_model=ProfessionalResponse)
async def create_professional(professional: ProfessionalCreate):
    """Cadastrar um novo profissional com biometria"""
    try:
        # Verificar se já existe profissional com esse code (credential_id)
        existing = supabase.table('professionals').select('*').eq('code', professional.code).execute()
        
        if existing.data and len(existing.data) > 0:
            raise HTTPException(status_code=400, detail="Profissional já cadastrado com esta digital")
        
        # Verificar se já existe email
        existing_email = supabase.table('professionals').select('*').eq('email', professional.email).execute()
        if existing_email.data and len(existing_email.data) > 0:
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        
        # Inserir novo profissional
        data = professional.model_dump()
        result = supabase.table('professionals').insert(data).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=500, detail="Erro ao cadastrar profissional")
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar profissional: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar profissional: {str(e)}")


@api_router.get("/professionals/by-code/{code}", response_model=ProfessionalResponse)
async def get_professional_by_code(code: str):
    """Buscar profissional pelo código da digital (credential_id)"""
    try:
        result = supabase.table('professionals').select('*').eq('code', code).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Profissional não encontrado")
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar profissional: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar profissional: {str(e)}")


@api_router.get("/professionals", response_model=List[ProfessionalResponse])
async def list_professionals():
    """Listar todos os profissionais"""
    try:
        result = supabase.table('professionals').select('*').order('name').execute()
        return result.data
    
    except Exception as e:
        logger.error(f"Erro ao listar profissionais: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao listar profissionais: {str(e)}")


# ===========================
# ATTENDANCE LISTS ENDPOINTS
# ===========================

@api_router.post("/attendance-lists", response_model=AttendanceListResponse)
async def create_attendance_list(attendance_list: AttendanceListCreate):
    """Criar uma nova lista de presença"""
    try:
        data = attendance_list.model_dump()
        data['status'] = 'active'
        
        result = supabase.table('attendance_lists').insert(data).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=500, detail="Erro ao criar lista de presença")
        
        return result.data[0]
    
    except Exception as e:
        logger.error(f"Erro ao criar lista de presença: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar lista de presença: {str(e)}")


@api_router.get("/attendance-lists/{list_id}", response_model=AttendanceListResponse)
async def get_attendance_list(list_id: str):
    """Buscar uma lista de presença específica"""
    try:
        result = supabase.table('attendance_lists').select('*').eq('id', list_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Lista de presença não encontrada")
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar lista de presença: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar lista: {str(e)}")


@api_router.get("/attendance-lists", response_model=List[AttendanceListResponse])
async def list_attendance_lists():
    """Listar todas as listas de presença"""
    try:
        result = supabase.table('attendance_lists').select('*').order('created_at', desc=True).execute()
        return result.data
    
    except Exception as e:
        logger.error(f"Erro ao listar listas de presença: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao listar listas: {str(e)}")


@api_router.put("/attendance-lists/{list_id}/complete")
async def complete_attendance_list(list_id: str):
    """Finalizar uma lista de presença e calcular duração"""
    try:
        # Buscar a lista
        list_result = supabase.table('attendance_lists').select('*').eq('id', list_id).execute()
        
        if not list_result.data or len(list_result.data) == 0:
            raise HTTPException(status_code=404, detail="Lista não encontrada")
        
        attendance_list = list_result.data[0]
        
        # Calcular duração
        start_time = datetime.fromisoformat(attendance_list['start_time'].replace('Z', '+00:00'))
        end_time = datetime.now(timezone.utc)
        
        duration_seconds = int((end_time - start_time).total_seconds())
        hours = duration_seconds // 3600
        minutes = (duration_seconds % 3600) // 60
        
        if hours > 0:
            duration_str = f"{hours}h{minutes}min"
        else:
            duration_str = f"{minutes}min"
        
        # Atualizar lista
        update_data = {
            'status': 'completed',
            'end_time': end_time.isoformat(),
            'duration': duration_str
        }
        
        result = supabase.table('attendance_lists').update(update_data).eq('id', list_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=500, detail="Erro ao finalizar lista")
        
        return {"message": "Lista finalizada com sucesso", "duration": duration_str}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao finalizar lista: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao finalizar lista: {str(e)}")


# ===========================
# ATTENDANCE RECORDS ENDPOINTS
# ===========================

@api_router.post("/attendance-records", response_model=AttendanceRecordResponse)
async def create_attendance_record(record: AttendanceRecordCreate):
    """Registrar presença usando biometria"""
    try:
        # Buscar profissional pelo código da digital
        prof_result = supabase.table('professionals').select('*').eq('code', record.code).execute()
        
        if not prof_result.data or len(prof_result.data) == 0:
            raise HTTPException(status_code=404, detail="Profissional não encontrado. Por favor, cadastre-se primeiro.")
        
        professional = prof_result.data[0]
        
        # Buscar lista de presença
        list_result = supabase.table('attendance_lists').select('*').eq('id', record.list_id).execute()
        
        if not list_result.data or len(list_result.data) == 0:
            raise HTTPException(status_code=404, detail="Lista de presença não encontrada")
        
        attendance_list = list_result.data[0]
        
        if attendance_list['status'] != 'active':
            raise HTTPException(status_code=400, detail="Esta lista de presença já foi finalizada")
        
        # Verificar se já registrou presença nesta lista
        existing = supabase.table('attendance_records').select('*').eq('list_id', record.list_id).eq('professional_id', professional['id']).execute()
        
        if existing.data and len(existing.data) > 0:
            raise HTTPException(status_code=400, detail="Presença já registrada nesta lista")
        
        # Contar registros existentes para definir row_number
        count_result = supabase.table('attendance_records').select('*', count='exact').eq('list_id', record.list_id).execute()
        row_number = count_result.count + 1
        
        # Criar registro de presença
        record_data = {
            'list_id': record.list_id,
            'professional_id': professional['id'],
            'local': attendance_list['location'],
            'row_number': row_number
        }
        
        insert_result = supabase.table('attendance_records').insert(record_data).execute()
        
        if not insert_result.data or len(insert_result.data) == 0:
            raise HTTPException(status_code=500, detail="Erro ao registrar presença")
        
        # Retornar com dados do profissional
        response_data = insert_result.data[0]
        response_data['professional_name'] = professional['name']
        response_data['professional_email'] = professional['email']
        response_data['professional_profession'] = professional['profession']
        response_data['professional_company'] = professional['company']
        
        return response_data
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao registrar presença: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao registrar presença: {str(e)}")


@api_router.get("/attendance-records/list/{list_id}")
async def get_attendance_records_by_list(list_id: str):
    """Buscar todos os registros de presença de uma lista"""
    try:
        # Buscar registros com JOIN (usando Supabase's foreign key)
        result = supabase.table('attendance_records').select(
            '*, professionals(name, email, profession, company)'
        ).eq('list_id', list_id).order('row_number').execute()
        
        # Formatar resposta
        records = []
        for record in result.data:
            prof = record.get('professionals', {})
            records.append({
                'id': record['id'],
                'list_id': record['list_id'],
                'professional_id': record['professional_id'],
                'professional_name': prof.get('name', ''),
                'professional_email': prof.get('email', ''),
                'professional_profession': prof.get('profession', ''),
                'professional_company': prof.get('company', ''),
                'entry_time': record['entry_time'],
                'local': record['local'],
                'row_number': record['row_number'],
                'created_at': record['created_at']
            })
        
        return records
    
    except Exception as e:
        logger.error(f"Erro ao buscar registros: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar registros: {str(e)}")


# ===========================
# PDF GENERATION
# ===========================

@api_router.get("/attendance-lists/{list_id}/pdf")
async def generate_pdf(list_id: str):
    """Gerar PDF da lista de presença no formato do modelo"""
    try:
        # Buscar lista de presença
        list_result = supabase.table('attendance_lists').select('*').eq('id', list_id).execute()
        
        if not list_result.data or len(list_result.data) == 0:
            raise HTTPException(status_code=404, detail="Lista não encontrada")
        
        attendance_list = list_result.data[0]
        
        # Buscar registros de presença
        records_result = supabase.table('attendance_records').select(
            '*, professionals(name, email, profession, company)'
        ).eq('list_id', list_id).order('row_number').execute()
        
        # Criar PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, 
                              rightMargin=0.5*inch, leftMargin=0.5*inch,
                              topMargin=0.5*inch, bottomMargin=0.5*inch)
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Estilo para título
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=12,
            textColor=colors.black,
            alignment=TA_CENTER,
            spaceAfter=20
        )
        
        # Título
        title = Paragraph(
            "FORMULÁRIO DE TREINAMENTO / LISTA DE PRESENÇA<br/>"
            "TRAINING ROSTER FORM / ATTENDANCE LIST",
            title_style
        )
        elements.append(title)
        elements.append(Spacer(1, 0.2*inch))
        
        # Informações da instalação e data
        info_data = [
            ['INSTALAÇÃO / FACILITY:', attendance_list['installation_name'], '', 
             'DATA / DATE:', attendance_list['meeting_date'], 
             'DURAÇÃO / DURATION:', attendance_list.get('duration', 'Em andamento')]
        ]
        
        info_table = Table(info_data, colWidths=[1.2*inch, 2*inch, 0.3*inch, 0.8*inch, 1*inch, 1.2*inch, 0.8*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 0.15*inch))
        
        # Título do curso
        course_data = [
            ['TÍTULO DO CURSO / COURSE TITLE:', attendance_list['course_title']]
        ]
        course_table = Table(course_data, colWidths=[2*inch, 5.5*inch])
        course_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        elements.append(course_table)
        elements.append(Spacer(1, 0.1*inch))
        
        # Conteúdo do curso
        content_style = ParagraphStyle('ContentStyle', parent=styles['Normal'], fontSize=7)
        content_para = Paragraph(attendance_list['course_content'], content_style)
        
        content_data = [
            ['CONTEÚDO / CONTENT:', content_para]
        ]
        content_table = Table(content_data, colWidths=[2*inch, 5.5*inch])
        content_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, 0), 8),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        elements.append(content_table)
        elements.append(Spacer(1, 0.15*inch))
        
        # Dados do instrutor
        instructor_data = [
            ['NOME DO INSTRUTOR / INSTRUCTOR NAME:', attendance_list['instructor_name'], 
             'FUNÇÃO / ROLE:', attendance_list['instructor_role'], 
             'ASSINATURA / SIGNATURE:', ''],
            ['QUALIFICAÇÃO / QUALIFICATION:', attendance_list['instructor_qualification'], '', '', '', '']
        ]
        
        instructor_table = Table(instructor_data, colWidths=[1.8*inch, 1.8*inch, 0.8*inch, 1*inch, 1.2*inch, 0.9*inch])
        instructor_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('SPAN', (1, 1), (5, 1)),
        ]))
        elements.append(instructor_table)
        elements.append(Spacer(1, 0.2*inch))
        
        # Cabeçalho da tabela de participantes
        header_data = [
            ['Nº', 'NOME COMPLETO\nFULL NAME', 'EMAIL\nE-MAIL', 
             'FUNÇÃO\nROLE', 'LOCALIZAÇÃO\nLOCATION', 'EMPRESA\nCOMPANY']
        ]
        
        # Adicionar registros de presença
        attendance_data = header_data.copy()
        
        for record in records_result.data:
            prof = record.get('professionals', {})
            entry_time_str = datetime.fromisoformat(record['entry_time'].replace('Z', '+00:00')).strftime('%d/%m/%Y %H:%M')
            
            attendance_data.append([
                str(record['row_number']),
                prof.get('name', ''),
                prof.get('email', 'N/A'),
                prof.get('profession', ''),
                record['local'],
                prof.get('company', '')
            ])
        
        # Adicionar linhas vazias até completar 30
        for i in range(len(records_result.data) + 1, 31):
            attendance_data.append([str(i), '', 'N/A', '', attendance_list['location'], ''])
        
        # Criar tabela de participantes
        participants_table = Table(attendance_data, 
                                  colWidths=[0.4*inch, 2*inch, 1.5*inch, 1.3*inch, 1.3*inch, 1*inch])
        
        participants_table.setStyle(TableStyle([
            # Header style
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 7),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
            # Data style
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 7),
            ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # Nº centralizado
            ('ALIGN', (1, 1), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.Color(0.95, 0.95, 0.95)]),
        ]))
        
        elements.append(participants_table)
        elements.append(Spacer(1, 0.2*inch))
        
        # Nota
        note_style = ParagraphStyle('NoteStyle', parent=styles['Normal'], fontSize=6, textColor=colors.grey)
        note = Paragraph(
            "Note: When the training is carried out on board, it will not be necessary to fill in the location and email for employees that are fixed of the unit.<br/>"
            "Nota: Quando o treinamento for realizado a bordo não será preciso preencher a localização e e-mail para os empregados que são fixo da unidade.",
            note_style
        )
        elements.append(note)
        elements.append(Spacer(1, 0.1*inch))
        
        # Rodapé
        footer = Paragraph(
            "Guia de Treinamento e Desenvolvimento / Training and Development Guide<br/>3500-MSB60-HRSTD-0006-04",
            note_style
        )
        elements.append(footer)
        
        # Construir PDF
        doc.build(elements)
        buffer.seek(0)
        
        # Retornar PDF
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=lista_presenca_{list_id}.pdf"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao gerar PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar PDF: {str(e)}")


# ===========================
# HEALTH CHECK
# ===========================

@api_router.get("/")
async def root():
    return {"message": "API de Lista de Presença Biométrica"}


@api_router.get("/health")
async def health_check():
    try:
        # Testar conexão com Supabase
        result = supabase.table('professionals').select('id').limit(1).execute()
        return {"status": "healthy", "supabase": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
