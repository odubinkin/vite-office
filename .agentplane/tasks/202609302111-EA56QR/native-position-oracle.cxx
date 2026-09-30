
#include <cstdint>
#include <iostream>
using sal_Int32=int32_t;
class SvxNumberFormat {public:
 enum Mode {LABEL_WIDTH_AND_POSITION,LABEL_ALIGNMENT};
 Mode mePositionAndSpaceMode;
 sal_Int32 nAbsLSpace,nFirstLineOffset;
 short nCharTextDistance;
 int64_t mnFirstLineIndent,mnIndentAt;
 int64_t GetFirstLineIndent() const {return mnFirstLineIndent;}
 int64_t GetIndentAt() const {return mnIndentAt;}
 sal_Int32 GetAbsLSpace() const;
 sal_Int32 GetFirstLineOffset() const;
 short GetCharTextDistance() const;
};
sal_Int32 SvxNumberFormat::GetAbsLSpace() const
{
    return mePositionAndSpaceMode == LABEL_WIDTH_AND_POSITION
           ? nAbsLSpace
           : static_cast<sal_Int32>( GetFirstLineIndent() + GetIndentAt() );
}

sal_Int32 SvxNumberFormat::GetFirstLineOffset() const
{
    return mePositionAndSpaceMode == LABEL_WIDTH_AND_POSITION
           ? nFirstLineOffset
           : static_cast<sal_Int32>( GetFirstLineIndent() );
}

short SvxNumberFormat::GetCharTextDistance() const
{
    return mePositionAndSpaceMode == LABEL_WIDTH_AND_POSITION ? nCharTextDistance : 0;
}

int main() {int mode; int64_t left,offset,distance,first,indent;
 while(std::cin>>mode>>left>>offset>>distance>>first>>indent) {
  SvxNumberFormat format{static_cast<SvxNumberFormat::Mode>(mode),static_cast<sal_Int32>(left),static_cast<sal_Int32>(offset),static_cast<short>(distance),first,indent};
  std::cout<<format.GetAbsLSpace()<<' '<<format.GetFirstLineOffset()<<' '<<format.GetCharTextDistance()<<'\n';
 }
}
